import { registerRootComponent } from 'expo';
import React, { useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from './src/utils/AsyncStorage';

import App from './App';

// new: wrapper that ensures /register is called when onboarding is not complete,
// and that computes + sends macros to /update_user_macs after onboarding completes.
function RootWrapper() {
	const [ready, setReady] = useState(false);
	const pollRef = useRef(null);
    const API_BASE = 'https://backend-production-28e8.up.railway.app'; // <- backend base URL
	// const API_BASE = 'http://100.101.234.55:8000'; // <- backend base URL

	async function callRegisterIfNeeded() {
		try {
			const onboarded = await storage.getOnboardedStatus();
			if (!onboarded) {

				const res = await fetch(`${API_BASE}/register`, {
					method: 'GET',
					credentials: 'include', // include to let backend set cookie
				});
				// console.log(res)
				// console.log(await res.text())
			}
		} catch (err) {
			// small silent failure; real app should log
			console.warn('register call failed', err);
		}
	}

	// simple macro calculator from onboarding data
	function calculateMacros(onboard) {
		const weight = Number(onboard?.weight ?? 70);
		const height = Number(onboard?.height ?? 175);
		const age = Number(onboard?.age ?? 30);
		const sex = (onboard?.sex ?? 'male').toLowerCase();
		
		// Map activity level IDs to multipliers
		const activityLevel = onboard?.activityLevel || 'moderately_active';
		const activityMap = {
			'sedentary': 1.2,
			'lightly_active': 1.375,
			'moderately_active': 1.55,
			'very_active': 1.725,
			'extra_active': 1.9
		};
		const activityFactor = activityMap[activityLevel] || 1.55;
		
		// Map goal IDs properly
		const goalMap = {
			'loseWeight': 'lose',
			'maintain': 'maintain',
			'gainMuscle': 'gain'
		};
		const goal = goalMap[onboard?.goal?.id] || goalMap[onboard?.goal] || 'maintain';
		
		// Calculate BMR
		let bmr = 10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161);
		let calories = Math.round(bmr * activityFactor);
		
		// Adjust for goal
		if (goal === 'lose') calories = Math.round(calories * 0.85);
		else if (goal === 'gain') calories = Math.round(calories * 1.15);
		
		// Calculate macros
		const proteinGrams = Math.round(1.6 * weight);
		const proteinCalories = proteinGrams * 4;
		
		const fatCalories = Math.round(calories * 0.25);
		const fatGrams = Math.round(fatCalories / 9);
		
		const carbsCalories = Math.max(0, calories - proteinCalories - fatCalories);
		const carbsGrams = Math.round(carbsCalories / 4);
		
		return {
			protein: proteinGrams,
			fat: fatGrams,
			carbs: carbsGrams,
			cals: calories
		};
	}

	async function sendUserMacros(macros) {
		try {
            console.log("Sending macros", macros);
			await fetch(`${API_BASE}/update_user_macs`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(macros),
			});
		} catch (err) {
			console.warn('failed to send macros', err);
		}
	}

	async function fetchRecommendations(hall = 'Windsor', day = 0, meal_type = 'breakfast') {
		try {
			const url = `${API_BASE}/recommend_mean`;
			const payload = { day, hall, meal_type };

			// Try POST first (preferred)
			let res = await fetch(url, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			// Read body as text once, then try to parse JSON
			const text = await res.text(); 

			if (!res.ok) {
				// attempt to parse error body as JSON if possible
				try {
					return JSON.parse(text);
				} catch (e) {
					return null;
				}
			}

			if (!text) return null;

			try {
				return JSON.parse(text);
			} catch (e) {
				// Response isn't JSON — return raw text for debugging
				console.warn('recommend response not JSON', e);
				return text;
			}
		} catch (err) {
			return null;
		}
	}

	// fetch recommendations for next 6 days and all meal types, save to storage
	async function fetchAndStoreAllRecommendations(hall = 'Windsor', days = 2) {
		try {
			const mealTypes = ['breakfast', 'lunch', 'dinner'];
			const result = {}; // structure: { day: { mealType: data } }
			for (let d = 0; d < days; d++) {
				result[d] = {};
				for (const m of mealTypes) { 
					const rec = await fetchRecommendations(hall, d, m);
                    rec["hall"] = rec["name"];
					result[d][m] = rec;
				}
			}
            // console.log(result)
			await storage.saveRecommendations(result);
			return result;
		} catch (err) {
			console.warn('fetchAndStoreAllRecommendations error', err);
			return null;
		}
	}

	// one-time sync used when onboarding already finished
	async function doOneTimeSyncIfOnboarded() {
		try {
			const onboarded = await storage.getOnboardedStatus();
			if (!onboarded) return;
			const onboardingData = (await storage.getOnboardingData()) || {};
			const macros = calculateMacros(onboardingData);
			// await sendUserMacros(macros);
            const hall = 'Earhart';
			await fetchAndStoreAllRecommendations(hall, 6);
		} catch (e) {
			console.warn('doOneTimeSyncIfOnboarded error', e);
		}
	}

	// poll using storage helpers - only start this if onboarding hasn't finished
	async function startOnboardingWatcher() {
		if (pollRef.current) return;
		pollRef.current = setInterval(async () => {
			try {
				const onboarded = await storage.getOnboardedStatus();
				if (onboarded === true) {
					clearInterval(pollRef.current);
					pollRef.current = null;
					const onboardingData = (await storage.getOnboardingData()) || {};
					const macros = calculateMacros(onboardingData);
					await sendUserMacros(macros);

					// fetch real meal recommendations after onboarding completes
					const hall = onboardingData?.hall ?? 'Earhart';
					await fetchAndStoreAllRecommendations(hall, 6);
				}
			} catch (e) {
				// ignore individual poll errors
			}
		}, 2000);
	}

	useEffect(() => {
		let mounted = true;
		(async () => {
			await callRegisterIfNeeded();
			if (!mounted) return;

			// Only start watcher if onboarding is NOT complete. If onboarding already finished,
			// run a one-time sync to ensure macros and recommendations are uploaded/fetched.
			const onboarded = await storage.getOnboardedStatus();
			if (onboarded) {
				await doOneTimeSyncIfOnboarded();
			} else {
				startOnboardingWatcher();
			}

			setReady(true);
		})();
		const sub = AppState.addEventListener?.('change', (next) => {
			// subtle: if app returns to foreground, re-run register check
			if (next === 'active') callRegisterIfNeeded();
		});
		return () => {
			mounted = false;
			if (pollRef.current) clearInterval(pollRef.current);
			if (sub?.remove) sub.remove();
		};
	}, []);

	// render the real app once wrapper is ready
	if (!ready) {
		// lightweight placeholder; replace with splash if desired
		return null;
	}
	return <App />;
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(RootWrapper);

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const VerticalPicker = ({ data, onValueChange, selectedValue, unit }) => {
  const scrollViewRef = useRef(null);
  
  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const value = data[index];
    if (value !== undefined && value !== selectedValue) {
      onValueChange(value);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current && selectedValue !== null && data.length > 0) {
      const index = data.indexOf(selectedValue);
      if (index > -1) {
        scrollViewRef.current.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
      }
    }
  }, [selectedValue, data]);


  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          onScrollEndDrag={handleScroll}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={{ paddingTop: ITEM_HEIGHT * 2, paddingBottom: ITEM_HEIGHT * 2 }}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
        >
          {data.map((item, index) => (
            <View key={index} style={styles.item}>
              <Text style={[styles.itemText, selectedValue === item && styles.selectedItemText]}>
                {item}
              </Text>
            </View>
          ))}
        </ScrollView>
        <LinearGradient
          colors={['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']}
          style={styles.gradient}
          pointerEvents="none"
        />
        <View style={styles.selectionIndicator} pointerEvents="none" />
      </View>
      <Text style={styles.unitText}>{unit}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pickerContainer: {
    height: PICKER_HEIGHT,
    width: 80,
    position: 'relative',
    overflow: 'hidden',
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  selectedItemText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  selectionIndicator: {
    position: 'absolute',
    top: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: Colors.primary + '10',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.primary + '30',
  },
  unitText: {
    marginTop: 8,
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default VerticalPicker;

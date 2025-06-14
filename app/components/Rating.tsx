import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface RatingProps {
  value: number;
  size?: 'small' | 'medium' | 'large';
  maxRating?: number;
  readonly?: boolean;
  showValue?: boolean;
  onRatingChange?: (rating: number) => void;
  containerStyle?: any;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  size = 'medium',
  maxRating = 5,
  readonly = false,
  showValue = false,
  onRatingChange,
  containerStyle,
}) => {
  const getStarSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  const handlePress = (rating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(rating);
    }
  };

  const renderStars = () => {
    const stars = [];
    const starSize = getStarSize();

    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= value;
      const isHalf = !isFilled && i - 0.5 <= value;

      stars.push(
        <Pressable
          key={i}
          onPress={() => handlePress(i)}
          disabled={readonly}
          style={styles.starContainer}
        >
          <MaterialIcons
            name={isFilled ? 'star' : isHalf ? 'star-half' : 'star-border'}
            size={starSize}
            color={isFilled || isHalf ? '#FFD700' : '#d1d5db'}
            style={[
              styles.star,
              !readonly && styles.interactiveStar,
            ]}
          />
        </Pressable>
      );
    }

    return stars;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      
      {showValue && (
        <Text style={[styles.value, { fontSize: getTextSize() }]}>
          {value.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    padding: 2,
  },
  star: {
    marginHorizontal: 1,
  },
  interactiveStar: {
    opacity: 0.8,
  },
  value: {
    marginLeft: 8,
    color: '#4b5563',
    fontWeight: '600',
  },
}); 
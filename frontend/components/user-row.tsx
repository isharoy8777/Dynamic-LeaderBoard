/**
 * UserRow Component
 * 
 * A reusable component for displaying a single user in the leaderboard.
 * This component renders the user's rank, username, and rating.
 * 
 * IMPORTANT: The rank displayed here comes DIRECTLY from the backend.
 * The frontend NEVER computes or modifies the rank value.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface UserRowProps {
  rank: number;
  username: string;
  rating: number;
  // Optional: highlight the row (e.g., for search results)
  isHighlighted?: boolean;
}

/**
 * Get medal emoji for top 3 ranks
 */
function getRankBadge(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
}

/**
 * Get color based on rating tier
 * Higher ratings get more prominent colors
 */
function getRatingColor(rating: number, isDark: boolean): string {
  if (rating >= 4000) return '#FFD700'; // Gold - Legendary
  if (rating >= 3000) return '#E74C3C'; // Red - Master
  if (rating >= 2000) return '#9B59B6'; // Purple - Expert
  if (rating >= 1500) return '#3498DB'; // Blue - Advanced
  if (rating >= 1000) return '#27AE60'; // Green - Intermediate
  return isDark ? '#9BA1A6' : '#687076'; // Gray - Beginner
}

export function UserRow({ rank, username, rating, isHighlighted = false }: UserRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const colors = Colors[colorScheme ?? 'light'];
  const ratingColor = getRatingColor(rating, isDark);
  const rankBadge = getRankBadge(rank);
  
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isHighlighted
            ? isDark ? '#2a2a2a' : '#f0f8ff'
            : isDark ? '#1a1a1a' : '#ffffff',
          borderBottomColor: isDark ? '#333' : '#eee',
        },
      ]}
    >
      {/* Rank Column - Always from backend, never computed locally */}
      <View style={styles.rankContainer}>
        <Text style={[styles.rankText, { color: colors.text }]}>
          {rankBadge || `#${rank}`}
        </Text>
        {rankBadge && (
          <Text style={[styles.rankNumber, { color: colors.icon }]}>#{rank}</Text>
        )}
      </View>
      
      {/* Username Column */}
      <View style={styles.usernameContainer}>
        <Text
          style={[styles.usernameText, { color: colors.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {username}
        </Text>
      </View>
      
      {/* Rating Column */}
      <View style={styles.ratingContainer}>
        <Text style={[styles.ratingText, { color: ratingColor }]}>
          {rating}
        </Text>
        <Text style={[styles.ratingLabel, { color: colors.icon }]}>
          rating
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rankContainer: {
    width: 60,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700',
  },
  rankNumber: {
    fontSize: 12,
    marginTop: 2,
  },
  usernameContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '500',
  },
  ratingContainer: {
    width: 70,
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
  },
  ratingLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});

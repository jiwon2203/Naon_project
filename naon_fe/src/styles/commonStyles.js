import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  gradientCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  
  secondaryButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  secondaryButtonText: {
    color: colors.darkGray,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
    marginBottom: 4,
  },
  
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.gray,
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.darkGray,
    marginBottom: 12,
  },
  
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  
  backButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.base,
    marginLeft: 8,
  },
  
  searchBar: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: typography.sizes.base,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  
  filterChip: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  
  filterChipActive: {
    backgroundColor: colors.tags.blue.bg,
  },
  
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.darkGray,
  },
  
  filterChipTextActive: {
    color: colors.tags.blue.text,
  },
  
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  
  tagText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  starIcon: {
    color: '#fbbf24',
    marginRight: 2,
  },
  
  ratingText: {
    fontSize: typography.sizes.sm,
    color: colors.gray,
    marginLeft: 4,
  },
});
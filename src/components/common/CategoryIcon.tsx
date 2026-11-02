import React from 'react';
import * as LucideIcons from 'lucide-react';

interface CategoryIconProps {
  iconName?: string;
  category?: string;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  iconName, 
  category, 
  className = "w-5 h-5",
  color 
}) => {
  // Map category to default icon if not explicitly provided
  let name = iconName;
  if (!name && category) {
    const c = category.toLowerCase();
    if (c.includes('tea') || c.includes('coffee') || c.includes('snack') || c.includes('chai')) name = 'Coffee';
    else if (c.includes('food') || c.includes('grocer')) name = 'ShoppingBag';
    else if (c.includes('dine') || c.includes('cafe') || c.includes('restaurant')) name = 'Utensils';
    else if (c.includes('rent') || c.includes('house')) name = 'Home';
    else if (c.includes('car') || c.includes('transport') || c.includes('fuel')) name = 'Car';
    else if (c.includes('util') || c.includes('bill') || c.includes('electric')) name = 'Zap';
    else if (c.includes('emi') || c.includes('loan')) name = 'Landmark';
    else if (c.includes('subscrip') || c.includes('netflix')) name = 'PlaySquare';
    else if (c.includes('shop') || c.includes('cloth')) name = 'ShoppingBag';
    else if (c.includes('health') || c.includes('med')) name = 'HeartPulse';
    else if (c.includes('entertain') || c.includes('movie')) name = 'Film';
    else if (c.includes('salary') || c.includes('income')) name = 'Wallet';
    else if (c.includes('invest')) name = 'TrendingUp';
    else if (c.includes('freelance') || c.includes('work')) name = 'Laptop';
    else name = 'CircleDollarSign';
  }

  // Get icon from LucideIcons dictionary safely
  const IconComponent = (name && (LucideIcons as Record<string, any>)[name]) 
    ? (LucideIcons as Record<string, any>)[name] 
    : LucideIcons.CircleDollarSign;

  return <IconComponent className={className} style={color ? { color } : undefined} />;
};

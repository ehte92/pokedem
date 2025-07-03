This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Pokedem

## 🎨 Enhanced Featured Pokemon Component

The `FeaturedPokemon` component has been significantly enhanced with modern animations, improved interactivity, and better user experience features.

### ✨ New Features

#### 🎬 **Advanced Animations**
- **3D Card Effects**: Cards now have realistic 3D hover transformations with subtle rotations
- **Framer Motion Integration**: Smooth, performance-optimized animations throughout
- **Staggered Load Animations**: Pokemon data loads with beautiful sequential animations
- **Sparkle Effects**: Special visual effects for Legendary and Mythical Pokemon
- **Interactive Image Hover**: Pokemon images rotate and scale on interaction

#### 🏆 **Special Pokemon Recognition**
- **Legendary Indicators**: Golden borders and crown badges for Legendary Pokemon
- **Mythical Indicators**: Special sparkle effects and badges for Mythical Pokemon
- **Dynamic Theming**: Color schemes adapt based on Pokemon rarity

#### 📊 **Enhanced Data Display**
- **Quick Stats Preview**: Mini stat bars showing HP, Attack, Defense, and Speed
- **Average Stat Calculation**: Shows computed average stat value
- **Habitat Information**: Displays Pokemon's natural habitat when available
- **Generation Display**: Shows Pokemon generation in a clean format

#### 🎯 **Interactive Features**
- **Favorite System**: Heart button to mark Pokemon as favorites
- **Copy to Clipboard**: Quick copy Pokemon data as formatted JSON
- **Improved Tooltips**: Context-aware tooltips for all interactive elements
- **Better Loading States**: Enhanced loading animations with contextual messages

#### ♿ **Accessibility Improvements**
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Clear focus indicators and logical tab order
- **Semantic HTML**: Proper heading hierarchy and markup structure

#### 🎨 **Visual Enhancements**
- **Glassmorphism Design**: Modern frosted glass effects with backdrop blur
- **Gradient Backgrounds**: Dynamic color gradients based on Pokemon type
- **Improved Typography**: Better font weights and spacing
- **Status Indicators**: Visual connection and cache status indicators
- **Enhanced Error States**: Animated error messages with helpful feedback

#### ⚡ **Performance Features**
- **Smart Caching**: Visual indicators for cached vs. fresh data
- **Metrics Display**: Optional performance metrics display
- **Background Prefetching**: Intelligent prefetching of related Pokemon
- **Optimized Renders**: Reduced unnecessary re-renders with React optimization

### 🛠️ Component Props

```typescript
interface FeaturedPokemonProps {
  pokemonId: number;              // Pokemon ID to display
  showMetrics?: boolean;          // Show performance metrics
  enablePrefetching?: boolean;    // Enable background prefetching
  showStats?: boolean;            // Show quick stats preview
  showEvolution?: boolean;        // Fetch evolution chain data
  enableInteractions?: boolean;   // Enable interactive features
  className?: string;             // Additional CSS classes
}
```

### 🎯 Usage Examples

```tsx
// Basic usage
<FeaturedPokemon pokemonId={1} />

// With all features enabled
<FeaturedPokemon 
  pokemonId={150}
  showMetrics={true}
  showStats={true}
  enableInteractions={true}
  className="my-custom-class"
/>

// Performance-focused version
<FeaturedPokemon 
  pokemonId={25}
  enablePrefetching={true}
  showMetrics={true}
/>
```

### 🎨 Animation System

The component uses a comprehensive animation system built with Framer Motion:

- **Card Animations**: 3D transforms with realistic physics
- **Loading States**: Pulsing and rotating loading indicators
- **Content Reveal**: Staggered appearance of Pokemon information
- **Interactive Feedback**: Immediate visual response to user actions
- **Sparkle Effects**: Dynamic particle-like animations for special Pokemon

### 🎛️ Customization

The component is highly customizable through:

- **CSS Variables**: Easy theming through custom properties
- **Tailwind Classes**: Full Tailwind CSS compatibility
- **Animation Variants**: Modular animation system in `animation-variants.ts`
- **Conditional Features**: Each feature can be toggled on/off

### 📱 Responsive Design

The enhanced component maintains full responsiveness:

- **Mobile-First**: Optimized for mobile experiences
- **Adaptive Layouts**: Content adapts to different screen sizes
- **Touch-Friendly**: Proper touch targets and gestures
- **Performance Optimized**: Smooth animations across all devices

This enhanced `FeaturedPokemon` component provides a rich, interactive experience while maintaining excellent performance and accessibility standards.

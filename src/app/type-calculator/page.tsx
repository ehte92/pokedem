import TypeEffectivenessCalculator from '@/components/type-effectiveness-calculator';

const TypeCalculatorPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        Type Effectiveness Calculator
      </h1>
      <TypeEffectivenessCalculator />
    </div>
  );
};

export default TypeCalculatorPage;

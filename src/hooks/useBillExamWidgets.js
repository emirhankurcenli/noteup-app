import useBillWidget from './useBillWidget';
import useExamWidget from './useExamWidget';

/**
 * useBillExamWidgets - Composite hook combining useBillWidget & useExamWidget for backward compatibility.
 * SRP: Prefer importing useBillWidget or useExamWidget directly.
 */
const useBillExamWidgets = (options) => {
  const bill = useBillWidget(options);
  const exam = useExamWidget(options);

  return {
    ...bill,
    ...exam,
  };
};

export default useBillExamWidgets;
export { useBillWidget, useExamWidget };

import { createFileRoute } from '@tanstack/react-router';
import { debounce } from '../utils/debounce';
import { throttle } from '../utils/throttle';

export const Route = createFileRoute('/scroll/')({
  component: RouteComponent,
});

function RouteComponent() {
  function fetchData() {
    console.log('Stil Typing');
  }

  // Throttle the fetchData function with a delay of 5000 ms

  const throttledFetchData = throttle(fetchData, 2000);
  throttledFetchData();

  function debounceTest() {
    console.log('debounceTest executed');
  }

  const debouncedSearchData = debounce(debounceTest, 1000);

  // // Add an event listener to the window scroll event that calls the throttledFetchData function
  // window.addEventListener('scroll', throttledFetchData);

  const handleTest = () => {
    console.log('typing...');
    throttledFetchData();
    debouncedSearchData();
  };

  return <input onKeyDown={handleTest} />;
}

import { createSignal } from 'solid-js';

function App() {
  const [count, setCount] = createSignal(0);
  const [name, setName] = createSignal('SolidJS');

  return (
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Hello {name()}!</h1>
      <p>This is a SolidJS application with fine-grained reactivity.</p>
      
      <div style="margin: 20px 0;">
        <button onClick={() => setCount(count() + 1)}>
          Count: {count()}
        </button>
      </div>
      
      <div>
        <input 
          type="text" 
          value={name()} 
          onInput={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>
      
      <p>Click the button or type in the input to see SolidJS reactivity in action!</p>
    </div>
  );
}

export default App;

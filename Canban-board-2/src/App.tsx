import { Sidebar } from './components/Sidebar';
import { BoardView } from './components/BoardView';

function App() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <BoardView />
    </div>
  );
}

export default App;
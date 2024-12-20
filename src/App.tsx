import Counter from './Counter';
import TodoList from './TodoList';

function App() {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-8">Vite + React</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <Counter />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <TodoList />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;

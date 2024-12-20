import TodoList from './TodoList';

function App() {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-8">2주차 : TDD 연습해보기</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <TodoList />
                </div>
            </div>
        </div>
    );
}

export default App;

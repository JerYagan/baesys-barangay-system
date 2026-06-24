// src/App.jsx
// Root component — renders router and global UI (toasts)
import AppRouter from './router/AppRouter'
import Toast from './components/ui/Toast'

function App() {
  return (
    <>
      <AppRouter />
      <Toast />
    </>
  )
}

export default App

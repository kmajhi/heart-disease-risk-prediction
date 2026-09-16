import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ProtectedRoute, AdminRoute } from './ProtectedRoute'
import { LandingPage } from '../routes/LandingPage'
import { AboutPage } from '../routes/AboutPage'
import { DisclaimerPage } from '../routes/DisclaimerPage'
import { LoginPage } from '../routes/auth/LoginPage'
import { RegisterPage } from '../routes/auth/RegisterPage'
import { ForgotPasswordPage } from '../routes/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '../routes/auth/ResetPasswordPage'
import { ProfilePage } from '../routes/auth/ProfilePage'
import { SettingsPage } from '../routes/auth/SettingsPage'
import { ModelComparisonPage } from '../routes/models/ModelComparisonPage'
import { PredictionFormPage } from '../routes/predict/PredictionFormPage'
import { PredictionResultPage } from '../routes/predict/PredictionResultPage'
import { ComparePredictionsPage } from '../routes/predict/ComparePredictionsPage'
import { PredictionHistoryPage } from '../routes/history/PredictionHistoryPage'
import { AdminDashboardPage } from '../routes/admin/AdminDashboardPage'
import { DashboardPage } from '../routes/dashboard/DashboardPage'
import { NotFoundPage } from '../routes/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      { path: 'about', element: <AboutPage /> },
      { path: 'disclaimer', element: <DisclaimerPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password/:uid/:token', element: <ResetPasswordPage /> },
      { path: 'models/compare', element: <ModelComparisonPage /> },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'predict',
        element: (
          <ProtectedRoute>
            <PredictionFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'predictions/:id',
        element: (
          <ProtectedRoute>
            <PredictionResultPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'predictions/compare/:a/:b',
        element: (
          <ProtectedRoute>
            <ComparePredictionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            <PredictionHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

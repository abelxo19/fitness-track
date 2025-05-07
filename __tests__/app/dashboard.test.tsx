import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/(dashboard)/dashboard/page'
import { useSession } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Simple integration test for Dashboard
describe('Dashboard Integration', () => {
  beforeEach(() => {
    // Mock authenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    })
  })

  it('renders dashboard with user data', () => {
    render(<DashboardPage />)
    
    // Check for main dashboard elements
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument()
    
    // Check for dashboard cards/sections
    expect(screen.getByText(/Recent Workouts/i)).toBeInTheDocument()
    expect(screen.getByText(/Daily Nutrition/i)).toBeInTheDocument()
  })

  it('displays dashboard stats correctly', () => {
    render(<DashboardPage />)
    
    // Check for stat sections
    const statElements = screen.getAllByTestId('dashboard-stat')
    expect(statElements.length).toBeGreaterThan(0)
    
    // Check progress indicators are present
    const progressElements = screen.getAllByRole('progressbar')
    expect(progressElements.length).toBeGreaterThan(0)
  })
}) 
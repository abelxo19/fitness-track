import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import PersonalizedPlansPage from '@/app/(dashboard)/dashboard/plans/page'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}))

describe('PersonalizedPlansPage', () => {
  const mockSession = {
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  }

  beforeEach(() => {
    ;(useSession as jest.Mock).mockReturnValue(mockSession)
  })

  it('renders the page with initial state', () => {
    render(<PersonalizedPlansPage />)
    
    expect(screen.getByText('Personalized Fitness Plans')).toBeInTheDocument()
    expect(screen.getByText('Generate New Plan')).toBeInTheDocument()
  })

  it('shows profile completion message when profile is incomplete', async () => {
    render(<PersonalizedPlansPage />)
    
    const generateButton = screen.getByText('Generate New Plan')
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Please complete your profile first/i)).toBeInTheDocument()
    })
  })

  it('displays loading state while generating plan', async () => {
    // Mock a complete profile
    const mockProfile = {
      age: 30,
      gender: 'male',
      weight: 75,
      height: 180,
      activityLevel: 'moderate',
      fitnessGoal: 'weight_loss',
      dietaryRestrictions: [],
      medicalConditions: '',
      equipment: ['dumbbells'],
      timeAvailability: 60,
    }

    // Mock Firestore response
    const mockGetDoc = jest.fn().mockResolvedValue({
      exists: () => true,
      data: () => mockProfile,
    })

    require('firebase/firestore').getDoc.mockImplementation(mockGetDoc)

    render(<PersonalizedPlansPage />)
    
    const generateButton = screen.getByText('Generate New Plan')
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Generating your personalized plan/i)).toBeInTheDocument()
    })
  })

  it('displays error message when plan generation fails', async () => {
    // Mock Firestore error
    const mockGetDoc = jest.fn().mockRejectedValue(new Error('Failed to fetch profile'))
    require('firebase/firestore').getDoc.mockImplementation(mockGetDoc)

    render(<PersonalizedPlansPage />)
    
    const generateButton = screen.getByText('Generate New Plan')
    fireEvent.click(generateButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to generate plan/i)).toBeInTheDocument()
    })
  })
}) 
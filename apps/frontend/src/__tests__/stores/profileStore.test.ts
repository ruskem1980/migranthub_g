import {
  useProfileStore,
  type UserProfile,
  type Document,
} from '@/lib/stores/profileStore';

// Mock user profile for testing
const mockProfile: UserProfile = {
  id: 'profile-123',
  userId: 'user-456',
  fullName: 'Иван Иванов',
  fullNameLatin: 'Ivan Ivanov',
  birthDate: '1990-05-15',
  gender: 'male',
  passportNumber: 'AB1234567',
  passportIssueDate: '2020-01-01',
  passportExpiryDate: '2030-01-01',
  citizenship: 'UZ',
  entryDate: '2024-01-15',
  migrationCardNumber: 'MC123456',
  migrationCardExpiry: '2024-04-15',
  purpose: 'work',
  registrationAddress: 'Москва, ул. Примерная, д. 1',
  registrationExpiry: '2024-04-15',
  hostFullName: 'Петр Петров',
  hostAddress: 'Москва, ул. Примерная, д. 1',
  hasPatent: true,
  patentRegion: 'moscow',
  patentExpiry: '2024-12-31',
  employerName: 'ООО Компания',
  employerINN: '1234567890',
  phone: '+79001234567',
  email: 'ivan@example.com',
  language: 'ru',
  onboardingCompleted: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock document for testing
const mockDocument: Document = {
  id: 'doc-123',
  userId: 'user-456',
  type: 'passport',
  title: 'Паспорт',
  fileUri: '/documents/passport.jpg',
  thumbnailUri: '/documents/passport-thumb.jpg',
  ocrData: { number: 'AB1234567' },
  expiryDate: '2030-01-01',
  createdAt: '2024-01-01T00:00:00Z',
};

// Initial state for reset (without actions)
const initialStateData = {
  profile: null,
  documents: [] as Document[],
  isLoading: false,
  error: null,
};

describe('ProfileStore', () => {
  beforeEach(() => {
    // Reset store state before each test (preserve actions)
    useProfileStore.setState(initialStateData);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useProfileStore.getState();

      expect(state.profile).toBeNull();
      expect(state.documents).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Profile Actions', () => {
    describe('setProfile', () => {
      it('should set profile', () => {
        const { setProfile } = useProfileStore.getState();

        setProfile(mockProfile);

        const state = useProfileStore.getState();
        expect(state.profile).toEqual(mockProfile);
        expect(state.error).toBeNull();
      });

      it('should clear profile when set to null', () => {
        useProfileStore.setState({ profile: mockProfile });

        const { setProfile } = useProfileStore.getState();
        setProfile(null);

        expect(useProfileStore.getState().profile).toBeNull();
      });

      it('should clear error when setting profile', () => {
        useProfileStore.setState({ error: 'Some error' });

        const { setProfile } = useProfileStore.getState();
        setProfile(mockProfile);

        expect(useProfileStore.getState().error).toBeNull();
      });
    });

    describe('updateProfile', () => {
      it('should update profile with partial data', () => {
        useProfileStore.setState({ profile: mockProfile });

        const { updateProfile } = useProfileStore.getState();
        updateProfile({ fullName: 'Новое Имя' });

        const state = useProfileStore.getState();
        expect(state.profile?.fullName).toBe('Новое Имя');
        expect(state.profile?.passportNumber).toBe(mockProfile.passportNumber);
      });

      it('should update updatedAt timestamp', () => {
        useProfileStore.setState({ profile: mockProfile });

        const { updateProfile } = useProfileStore.getState();
        updateProfile({ phone: '+79009999999' });

        const state = useProfileStore.getState();
        expect(state.profile?.updatedAt).not.toBe(mockProfile.updatedAt);
      });

      it('should create profile if profile is null', () => {
        const { updateProfile } = useProfileStore.getState();
        updateProfile({ fullName: 'Test' });

        const profile = useProfileStore.getState().profile;
        expect(profile).not.toBeNull();
        expect(profile?.fullName).toBe('Test');
      });

      it('should update multiple fields at once', () => {
        useProfileStore.setState({ profile: mockProfile });

        const { updateProfile } = useProfileStore.getState();
        updateProfile({
          phone: '+79009999999',
          email: 'new@example.com',
          patentExpiry: '2025-12-31',
        });

        const state = useProfileStore.getState();
        expect(state.profile?.phone).toBe('+79009999999');
        expect(state.profile?.email).toBe('new@example.com');
        expect(state.profile?.patentExpiry).toBe('2025-12-31');
      });
    });
  });

  describe('Document Actions', () => {
    describe('setDocuments', () => {
      it('should set documents array', () => {
        const { setDocuments } = useProfileStore.getState();
        const documents = [mockDocument];

        setDocuments(documents);

        expect(useProfileStore.getState().documents).toEqual(documents);
      });

      it('should replace existing documents', () => {
        useProfileStore.setState({ documents: [mockDocument] });

        const newDoc: Document = { ...mockDocument, id: 'doc-new' };
        const { setDocuments } = useProfileStore.getState();
        setDocuments([newDoc]);

        const state = useProfileStore.getState();
        expect(state.documents).toHaveLength(1);
        expect(state.documents[0].id).toBe('doc-new');
      });
    });

    describe('addDocument', () => {
      it('should add a document', () => {
        const { addDocument } = useProfileStore.getState();

        addDocument(mockDocument);

        const state = useProfileStore.getState();
        expect(state.documents).toHaveLength(1);
        expect(state.documents[0]).toEqual(mockDocument);
      });

      it('should add document to existing list', () => {
        useProfileStore.setState({ documents: [mockDocument] });

        const newDoc: Document = { ...mockDocument, id: 'doc-new', type: 'migration_card' };
        const { addDocument } = useProfileStore.getState();
        addDocument(newDoc);

        const state = useProfileStore.getState();
        expect(state.documents).toHaveLength(2);
      });

      it('should add different document types', () => {
        const { addDocument } = useProfileStore.getState();

        const documentTypes: Document['type'][] = [
          'passport',
          'migration_card',
          'registration',
          'patent',
          'medical',
          'exam',
          'inn',
          'other',
        ];

        documentTypes.forEach((type, index) => {
          addDocument({
            ...mockDocument,
            id: `doc-${index}`,
            type,
          });
        });

        expect(useProfileStore.getState().documents).toHaveLength(8);
      });
    });

    describe('updateDocument', () => {
      it('should update a document by id', () => {
        useProfileStore.setState({ documents: [mockDocument] });

        const { updateDocument } = useProfileStore.getState();
        updateDocument('doc-123', { title: 'Обновленный паспорт' });

        const state = useProfileStore.getState();
        expect(state.documents[0].title).toBe('Обновленный паспорт');
      });

      it('should not affect other documents', () => {
        const doc2: Document = { ...mockDocument, id: 'doc-456', title: 'Другой документ' };
        useProfileStore.setState({ documents: [mockDocument, doc2] });

        const { updateDocument } = useProfileStore.getState();
        updateDocument('doc-123', { title: 'Обновленный' });

        const state = useProfileStore.getState();
        expect(state.documents.find((d) => d.id === 'doc-456')?.title).toBe('Другой документ');
      });

      it('should update expiry date', () => {
        useProfileStore.setState({ documents: [mockDocument] });

        const { updateDocument } = useProfileStore.getState();
        updateDocument('doc-123', { expiryDate: '2035-01-01' });

        expect(useProfileStore.getState().documents[0].expiryDate).toBe('2035-01-01');
      });

      it('should update OCR data', () => {
        useProfileStore.setState({ documents: [mockDocument] });

        const { updateDocument } = useProfileStore.getState();
        updateDocument('doc-123', {
          ocrData: { number: 'CD9876543', name: 'Иванов' },
        });

        const state = useProfileStore.getState();
        expect(state.documents[0].ocrData).toEqual({
          number: 'CD9876543',
          name: 'Иванов',
        });
      });
    });

    describe('removeDocument', () => {
      it('should remove a document by id', () => {
        useProfileStore.setState({ documents: [mockDocument] });

        const { removeDocument } = useProfileStore.getState();
        removeDocument('doc-123');

        expect(useProfileStore.getState().documents).toHaveLength(0);
      });

      it('should only remove the specified document', () => {
        const doc2: Document = { ...mockDocument, id: 'doc-456' };
        useProfileStore.setState({ documents: [mockDocument, doc2] });

        const { removeDocument } = useProfileStore.getState();
        removeDocument('doc-123');

        const state = useProfileStore.getState();
        expect(state.documents).toHaveLength(1);
        expect(state.documents[0].id).toBe('doc-456');
      });

      it('should do nothing if document id not found', () => {
        useProfileStore.setState({ documents: [mockDocument] });

        const { removeDocument } = useProfileStore.getState();
        removeDocument('non-existent');

        expect(useProfileStore.getState().documents).toHaveLength(1);
      });
    });
  });

  describe('Status Actions', () => {
    describe('setLoading', () => {
      it('should set loading to true', () => {
        const { setLoading } = useProfileStore.getState();

        setLoading(true);

        expect(useProfileStore.getState().isLoading).toBe(true);
      });

      it('should set loading to false', () => {
        useProfileStore.setState({ isLoading: true });

        const { setLoading } = useProfileStore.getState();
        setLoading(false);

        expect(useProfileStore.getState().isLoading).toBe(false);
      });
    });

    describe('setError', () => {
      it('should set error and clear loading', () => {
        useProfileStore.setState({ isLoading: true });

        const { setError } = useProfileStore.getState();
        setError('Profile loading failed');

        const state = useProfileStore.getState();
        expect(state.error).toBe('Profile loading failed');
        expect(state.isLoading).toBe(false);
      });

      it('should clear error when set to null', () => {
        useProfileStore.setState({ error: 'Previous error' });

        const { setError } = useProfileStore.getState();
        setError(null);

        expect(useProfileStore.getState().error).toBeNull();
      });
    });
  });

  describe('Reset', () => {
    it('should reset store to initial state', () => {
      useProfileStore.setState({
        profile: mockProfile,
        documents: [mockDocument],
        isLoading: true,
        error: 'Some error',
      });

      const { reset } = useProfileStore.getState();
      reset();

      const state = useProfileStore.getState();
      expect(state.profile).toBeNull();
      expect(state.documents).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle full profile lifecycle', () => {
      // 1. Start loading
      const { setLoading, setProfile, addDocument, updateProfile, reset } =
        useProfileStore.getState();

      setLoading(true);
      expect(useProfileStore.getState().isLoading).toBe(true);

      // 2. Set profile
      setProfile(mockProfile);
      expect(useProfileStore.getState().profile).toEqual(mockProfile);

      // 3. Stop loading
      setLoading(false);
      expect(useProfileStore.getState().isLoading).toBe(false);

      // 4. Add documents
      addDocument(mockDocument);
      expect(useProfileStore.getState().documents).toHaveLength(1);

      // 5. Update profile
      updateProfile({ phone: '+79999999999' });
      expect(useProfileStore.getState().profile?.phone).toBe('+79999999999');

      // 6. Reset (e.g., on logout)
      reset();
      expect(useProfileStore.getState().profile).toBeNull();
      expect(useProfileStore.getState().documents).toHaveLength(0);
    });

    it('should maintain profile integrity when updating documents', () => {
      useProfileStore.setState({
        profile: mockProfile,
        documents: [mockDocument],
      });

      const { addDocument, removeDocument } = useProfileStore.getState();

      // Add new document
      addDocument({ ...mockDocument, id: 'new-doc' });

      // Profile should remain unchanged
      expect(useProfileStore.getState().profile).toEqual(mockProfile);

      // Remove document
      removeDocument('new-doc');

      // Profile should still be unchanged
      expect(useProfileStore.getState().profile).toEqual(mockProfile);
    });
  });
});

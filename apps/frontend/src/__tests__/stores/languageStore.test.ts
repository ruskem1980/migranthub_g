import {
  useLanguageStore,
  LANGUAGES,
  EXTENDED_LANGUAGES,
  getLanguageInfo,
  type Language,
} from '@/lib/stores/languageStore';

// Initial state for reset (without actions)
const initialStateData = {
  language: 'ru' as Language,
  _hasHydrated: false,
};

describe('LanguageStore', () => {
  beforeEach(() => {
    // Reset store state before each test (preserve actions)
    useLanguageStore.setState(initialStateData);
  });

  describe('Initial State', () => {
    it('should have Russian as default language', () => {
      const state = useLanguageStore.getState();

      expect(state.language).toBe('ru');
    });

    it('should have hydration state as false initially', () => {
      const state = useLanguageStore.getState();

      expect(state._hasHydrated).toBe(false);
    });
  });

  describe('setLanguage', () => {
    it('should set language to Uzbek', () => {
      const { setLanguage } = useLanguageStore.getState();

      setLanguage('uz');

      expect(useLanguageStore.getState().language).toBe('uz');
    });

    it('should set language to Tajik', () => {
      const { setLanguage } = useLanguageStore.getState();

      setLanguage('tg');

      expect(useLanguageStore.getState().language).toBe('tg');
    });

    it('should set language to Kyrgyz', () => {
      const { setLanguage } = useLanguageStore.getState();

      setLanguage('ky');

      expect(useLanguageStore.getState().language).toBe('ky');
    });

    it('should support all 4 migrant languages', () => {
      const supportedLanguages: Language[] = ['ru', 'uz', 'tg', 'ky'];

      supportedLanguages.forEach((lang) => {
        const { setLanguage } = useLanguageStore.getState();
        setLanguage(lang);

        expect(useLanguageStore.getState().language).toBe(lang);
      });
    });
  });

  describe('setHasHydrated', () => {
    it('should set hydration state to true', () => {
      const { setHasHydrated } = useLanguageStore.getState();

      setHasHydrated(true);

      expect(useLanguageStore.getState()._hasHydrated).toBe(true);
    });

    it('should set hydration state to false', () => {
      useLanguageStore.setState({ _hasHydrated: true });

      const { setHasHydrated } = useLanguageStore.getState();
      setHasHydrated(false);

      expect(useLanguageStore.getState()._hasHydrated).toBe(false);
    });
  });
});

describe('LANGUAGES constant', () => {
  it('should have 5 main languages', () => {
    expect(LANGUAGES).toHaveLength(5);
  });

  it('should include Russian as first language', () => {
    expect(LANGUAGES[0]).toEqual({
      code: 'ru',
      name: 'Русский',
      nativeName: 'Русский',
      flag: expect.any(String),
    });
  });

  it('should include Uzbek', () => {
    const uzbek = LANGUAGES.find((l) => l.code === 'uz');
    expect(uzbek).toBeDefined();
  });

  it('should include Tajik', () => {
    const tajik = LANGUAGES.find((l) => l.code === 'tg');
    expect(tajik).toBeDefined();
  });

  it('should include Kyrgyz', () => {
    const kyrgyz = LANGUAGES.find((l) => l.code === 'ky');
    expect(kyrgyz).toBeDefined();
  });

  it('should have proper structure for all languages', () => {
    LANGUAGES.forEach((lang) => {
      expect(lang).toHaveProperty('code');
      expect(lang).toHaveProperty('name');
      expect(lang).toHaveProperty('nativeName');
      expect(lang).toHaveProperty('flag');
    });
  });
});

describe('EXTENDED_LANGUAGES constant', () => {
  it('should equal LANGUAGES (5 languages)', () => {
    expect(EXTENDED_LANGUAGES).toHaveLength(5);
    expect(EXTENDED_LANGUAGES).toEqual(LANGUAGES);
  });

  it('should include all main languages', () => {
    const mainLanguageCodes = LANGUAGES.map((l) => l.code);

    mainLanguageCodes.forEach((code) => {
      const found = EXTENDED_LANGUAGES.find((l) => l.code === code);
      expect(found).toBeDefined();
    });
  });

  it('should have proper structure for all extended languages', () => {
    EXTENDED_LANGUAGES.forEach((lang) => {
      expect(lang).toHaveProperty('code');
      expect(lang).toHaveProperty('name');
      expect(lang).toHaveProperty('nativeName');
      expect(lang).toHaveProperty('flag');
    });
  });
});

describe('getLanguageInfo', () => {
  it('should return language info for valid code', () => {
    const info = getLanguageInfo('ru');

    expect(info).toEqual({
      code: 'ru',
      name: 'Русский',
      nativeName: 'Русский',
      flag: expect.any(String),
    });
  });

  it('should return Uzbek language info', () => {
    const info = getLanguageInfo('uz');

    expect(info.code).toBe('uz');
    expect(info.nativeName).toBe("O'zbek");
  });

  it('should return Tajik language info', () => {
    const info = getLanguageInfo('tg');

    expect(info.code).toBe('tg');
    expect(info.nativeName).toBe('Тоҷикӣ');
  });

  it('should return Kyrgyz language info', () => {
    const info = getLanguageInfo('ky');

    expect(info.code).toBe('ky');
    expect(info.nativeName).toBe('Кыргызча');
  });

  it('should return default (Russian) for unknown code', () => {
    // Cast to Language to test fallback behavior
    const info = getLanguageInfo('xx' as Language);

    expect(info).toEqual(LANGUAGES[0]);
  });
});

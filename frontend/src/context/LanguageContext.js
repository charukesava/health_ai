import en from "../translations/en.json";
import te from "../translations/te.json";
import hi from "../translations/hi.json";
import ta from "../translations/ta.json";

export const LanguageContext = createContext({
  text: en,
  setLang: () => {},
});

const languages = { en, te, hi, ta };

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");

  const value = {
    text: languages[lang] || en,
    setLang,
    lang,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      welcome:     "Welcome back",
      editProfile: "Edit Profile",
      logout:      "Logout",
      dashboard:   "Dashboard",
      totalUsers:  "Total Users",
      activeSessions: "Active Sessions",
      loggedInAs:  "Logged In As",
      overview:    "Here's your admin overview",
      saveChanges: "Save Changes",
      fullName:    "Full Name",
      email:       "Email",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      backToDashboard: "Back to Dashboard",
      editProfileTitle: "Edit Profile",
      updateInfo:  "Update your account information",
      users: "Users",
    }
  },
  hi: {
    translation: {
      welcome:     "वापस स्वागत है",
      editProfile: "प्रोफ़ाइल संपादित करें",
      logout:      "लॉग आउट",
      dashboard:   "डैशबोर्ड",
      totalUsers:  "कुल उपयोगकर्ता",
      activeSessions: "सक्रिय सत्र",
      loggedInAs:  "लॉग इन है",
      overview:    "आपका एडमिन अवलोकन",
      saveChanges: "परिवर्तन सहेजें",
      fullName:    "पूरा नाम",
      email:       "ईमेल",
      newPassword: "नया पासवर्ड",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      backToDashboard: "डैशबोर्ड पर वापस",
      editProfileTitle: "प्रोफ़ाइल संपादित करें",
      updateInfo:  "अपनी खाता जानकारी अपडेट करें",
      users: "उपयोगकर्ता",
    }
  },
  gu: {
    translation: {
      welcome:     "પાછા સ્વાગત છે",
      editProfile: "પ્રોફાઇલ સંપાદિત કરો",
      logout:      "લૉગ આઉટ",
      dashboard:   "ડેશબોર્ડ",
      totalUsers:  "કુલ વપરાશકર્તાઓ",
      activeSessions: "સક્રિય સત્રો",
      loggedInAs:  "લૉગ ઇન છે",
      overview:    "તમારો એડમિન ઓવરવ્યૂ",
      saveChanges: "ફેરફારો સાચવો",
      fullName:    "પૂરું નામ",
      email:       "ઈમેઇલ",
      newPassword: "નવો પાસવર્ડ",
      confirmPassword: "પાસવર્ડની પુષ્ટિ કરો",
      backToDashboard: "ડેશબોર્ડ પર પાછા",
      editProfileTitle: "પ્રોફાઇલ સંપાદિત કરો",
      updateInfo:  "તમારી એકાઉન્ટ માહિતી અપડેટ કરો",
      users: "વપરાશકર્તાઓ",
      
    }
  },
  es: {
    translation: {
      welcome:     "Bienvenido de nuevo",
      editProfile: "Editar Perfil",
      logout:      "Cerrar sesión",
      dashboard:   "Panel de control",
      totalUsers:  "Total de usuarios",
      activeSessions: "Sesiones activas",
      loggedInAs:  "Conectado como",
      overview:    "Tu resumen de administrador",
      saveChanges: "Guardar cambios",
      fullName:    "Nombre completo",
      email:       "Correo electrónico",
      newPassword: "Nueva contraseña",
      confirmPassword: "Confirmar contraseña",
      backToDashboard: "Volver al panel",
      editProfileTitle: "Editar Perfil",
      updateInfo:  "Actualiza la información de tu cuenta",
      users: "Usuarios",
    }
  },
  fr: {
    translation: {
      welcome:     "Bon retour",
      editProfile: "Modifier le profil",
      logout:      "Se déconnecter",
      users: "Utilisateurs",
      dashboard:   "Tableau de bord",
      totalUsers:  "Total des utilisateurs",
      activeSessions: "Sessions actives",
      loggedInAs:  "Connecté en tant que",
      overview:    "Votre aperçu administrateur",
      saveChanges: "Enregistrer les modifications",
      fullName:    "Nom complet",
      email:       "E-mail",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      backToDashboard: "Retour au tableau de bord",
      editProfileTitle: "Modifier le profil",
      updateInfo:  "Mettez à jour les informations de votre compte",
    }
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
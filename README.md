# EETAC Virtual Assistant - Frontend (EA_WEB_G5)

Aquest és el directori del frontend per a la implementació de la interfície de l'assistent virtual acadèmic **"Toni"** de la EETAC.

## Descripció de l'Estat de l'Exercici
L'exercici s'ha completat al **100%** i es troba completament connectat amb el backend i operatiu.

---

## Parts Operatives

1. **Pàgina de l'Assistent (`src/pages/Assistant.tsx`)**:
   - Desenvolupament de la interfície de xat per a l'assistent.
   - Connexió amb els serveis de backend a través de l'endpoint de xat (`/assistant/chat`) mitjançant peticions axios.
   - **Formatejador de text millorat**: Detecció i renderització de negretes (`**`), títols i capçaleres (`#`, `##`, `###`) convertits a formats elegants, i suport per a llistes de viñetes utilitzant diferents marcadors (`-`, `*`, `•`).
   - Scroll automàtic al final de la llista en rebre nous missatges.

2. **Estils i Maquetació (`src/pages/Assistant.css`)**:
   - Posicionament i maquetació fixes i simètriques en paral·lel al Sidebar i Navbar existents.
   - Integració harmoniosa de fons i targetes de color mitjançant l'ús de les variables de disseny de l'aplicació (`var(--bg-card)`, `var(--border-subtle)`, `var(--text-main)`).
   - Estil adaptat per al mode clar i el mode fosc respectant els estils globals del projecte.
   - Cabecera plana sense ombra per a una millor estètica sobre el degradat principal de la web.

3. **Navegació i Traduccions (`src/components/Sidebar.tsx` i fitxers JSON de `src/locales`)**:
   - Botó d'accés integrat a la barra lateral esquerra amb rutes configurades a `App.tsx`.
   - Traduccions configurades per al botó de l'assistent tant en castellà (`es.json`) com en català (`ca.json`).

---

## Parts Pendents de Codificar
- **Cap**: Totes les funcionalitats i ajustos visuals demanats en el frontend estan completament tancats i operatius.
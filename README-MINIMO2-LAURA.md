# Front-end WEB - Mòdul de Mapa Interactiu d'Esdeveniments

Aquest repositori conté el codi de l'aplicació WEB per donar suport a la història d'usuari:
> **"Com a usuari, vull veure un mapa interactiu a la web i a l'app per a visualitzar els esdeveniments disponibles al meu voltant."**

S'han realitzat les integracions i el disseny de la interfície visual del mapa per connectar-se amb els serveis del backend.

## 📋 Estat de l'Exercici (WEB)

La plataforma WEB està completament operativa pel que fa a la interfície d'usuari, la renderització del mapa i la gestió d'esdeveniments. Visualitza correctament els elements i permet realitzar totes les accions interactives de l'usuari. Actualment, es planteja una millora en la lògica de visualització geogràfica per optimitzar l'experiència d'usuari (UX).

---

## ✅ Parts Operatives (Funciona correctament)

* **Visualització i Disseny del Mapa:** El mapa interactiu es carrega correctament a la pantalla i es renderitza sense errors.
* **Formulari de Creació:** Interfície operativa per enviar les dades i coordenades de nous esdeveniments al backend.
* **Detall de l'Esdeveniment:** Es pot seleccionar un esdeveniment per veure'n la informació detallada i actualitzada.
* **Interacció d'Usuari (Unir-se / Abandonar / Eliminar):** Els botons per apuntar-se a un esdeveniment, donar-se de baixa o esborrar-lo estan totalment vinculats i responen correctament a les accions de l'usuari en la interfície web.

---

## ⏳ Millores Pendents i Futures Funcionalitats

* **Optimització de la Visualització d'Esdeveniments al Mapa:**
    * **Comportament actual:** Actualment la web renderitza tots els esdeveniments que rep de l'API.
    * **Millora proposada:** S'ha de modificar la secció d'**"esdeveniments propers"** per delimitar visualment o mitjançant algun filtre aquells que es troben en el radi de proximitat de l'usuari. No obstant això, es mantindrà la capacitat de la WEB per permetre a l'usuari explorar i visualitzar també els esdeveniments més llunyans si es desplaça pel mapa (evitant ocultar completament la resta del catàleg).
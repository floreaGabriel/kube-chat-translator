# PLAN-IMPLEMENTARE

Scopul acestei teme este de a implementa, folosindu-va de Kubernetes si de diferite tehnologii pentru backend, baze de date si frontend, un site web ce contine un chat si o componenta ce va permite folosirea unei tehnologii de IA pusa la dispozitie de Azure.

## CERINTE INITIALE

1. **Arhitectura** :

-   *CMS(JOOMLA)*: Un site web simplu cu 6 replici, expus pe portul 80, cu o baza de date proprie
-   *CHAT*: 
    - Backend: .NET + NGINX cu 3 replici, expus pe portul 88
    - Frontend: React cu 1 replica, expus pe portul 90
-   *Aplicatie IA*: 
    - Frontend: React cu 1 replica
    - Procesare cu Azure Speech Translation 
    - Stocare fisier in Blob Azure Storage 
    - Date in SQL Database

**Totul ruleaza pe kubernetes, cu fisiere .yaml de configurare**

## PASI DE IMPLEMENTARE ✅❌
     
      

### 1. Configurarea mediului de lucru 📌

- Instalare Git: `brew install git`
- Instalare Docker Desktop: Descarcat de pe site-ul oficial.
- Instalare Minikube: `brew install minikube`
- Instalare kubectl: `brew install kubectl`

### 2. Implementarea CMS-ului (Joomla) 📌

- Joomla este un sistem de manageriere a contentului unui site web free. Joomla este scris in PHP si foloseste tehnici de programare orientata pe obiecte.
- Ideea principala a web site-ului meu este o pizzerie *"Pizzeria la gabita"*
- Pentru implementarea acestui CMS am realizat 2 componente individuale care comunica dependent una de alta. 
- Am creat `Dockerfile.joomla` care identifica componenta unica de *joomla*.
- Am creat `Dockerfile.mysql` care identifica componenta unica de mysql. *(Baza de date cu care comunica serviciul de joomla)*
- Apoi pentru a le combina intr-un singur serviciu mare, am creat `docker-compose.yaml` in care am combinat aceste 2 servicii intr-o componenta unica de restul proiectului. Astfel pot administra mai usor aceasta *componenta* pentru a o duce in productie.

❗❗❗ Am creat o diagrama pentru a intelege fluxul de acum + ce urmeaza sa fac cu sistemul de chat: [CMS + CHAT diagram explenation](https://excalidraw.com/#json=gqDPGHmof0GB98HKgKOn1,Pykh11mpzHvlC_2jMmdGyA)

### 3. Implementarea chat-ului 📌

- Sistemul de chat este o reprezentare simpla a unui *Chat Live*.
- Backendul acestuia este realizat cu frameworkul `ASP.NET Core`, care este un framework modern, cross-platform pentru dezvoltarea de aplicatii web si API-uri.
- Am folosit biblioteca **SignalR** pentru comunicarea in timp real. SignalR este o biblioteca care simplifica adaugarea functionalitatii in timp real in aplicatii web, permitand serverului sa trimita mesaje catre clienti instantaneu. SignalR foloseste in principal **WebSockets** pentru comunicarea bidirectionala, dar poate folosi si alte metode de transport (cum ar fi Server-Sent Events sau Long Polling) daca WebSockets nu este disponibil.

#### Structura Backend (`chat-backend`)
- **Hubs/ChatHub.cs**: Defineste `ChatHub`, un hub SignalR care gestioneaza comunicarea in timp real. In implementarea curenta, hub-ul trimite mesajele catre toti clientii conectati (`Clients.All.SendAsync`), creand un chat public.
- **Controllers/ChatController.cs**: Un API controller care expune un endpoint (`GET /api/chat`) pentru a obtine mesajele existente din baza de date.
- **Services/ChatService.cs**: Un serviciu care gestioneaza logica de business, inclusiv salvarea mesajelor in baza de date MongoDB.
- **Models/**: Contine modelul `ChatMessage` pentru stocarea mesajelor (cu campuri precum `Username`, `Message`, `Timestamp`).
- **Program.cs** si **Startup.cs**: Configureaza aplicatia ASP.NET Core, adauga SignalR, si seteaza dependintele (cum ar fi `ChatService`).

#### Baza de Date
- Am folosit **MongoDB** ca baza de date pentru stocarea mesajelor. MongoDB este o baza de date NoSQL care stocheaza datele in format JSON-like (documente).
- Conexiunea cu MongoDB este configurata in `docker-compose.yml` printr-un serviciu `mongodb`, iar aplicatia se conecteaza la acesta folosind connection string-ul `mongodb://mongodb:27017`.

#### Structura Frontend (`chat-frontend`)
- Frontendul este realizat cu **React** si este expus pe portul 90.
- **src/components/ChatComponent.jsx**: Componenta principala care afiseaza mesajele, permite trimiterea de mesaje noi, si arata statusul conexiunii.
- Frontendul comunica cu backendul prin:
  - **SignalR**: Pentru comunicarea in timp real (trimiterea si primirea mesajelor).
  - **HTTP**: Pentru a obtine mesajele existente prin apelarea endpoint-ului `/api/chat`.

#### Configurare Docker
- Am creat un `docker-compose.yml` care include:
  - Serviciul `dotnet` pentru backend (port 5079 mapeaza la 5000).
  - Serviciul `mongodb` pentru baza de date (port 27017).
  - Serviciul `nginx` pentru reverse proxy (port 88).
  - Serviciul `frontend` pentru React (port 90).

❗❗❗ Am creat o diagrama pentru a reprezenta flow-ul sistemului de chat: 
[Sistemul de chat Diagram](https://excalidraw.com/#json=5WR5QXd3570mrnS9FbAHo,NqAaYamSSlQM2May9txByQ)


### 4. Implementarea aplicatiei IA 📌
### 5. Configurare kubernetes 📌
### 6. Testare 📌
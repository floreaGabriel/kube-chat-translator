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
- Pentru implementarea acestui CMS am realizat 2 componente individuale care comunica dependent una de alta. 
- Am creat `Dockerfile.joomla` care identifica componenta unica de *joomla*.
- Am creat `Dockerfile.mysql` care identifica componenta unica de mysql. *(Baza de date cu care comunica serviciul de joomla)*
- Apoi pentru a le combina intr-un singur serviciu mare, am creat `docker-compose.yaml` in care am combinat aceste 2 servicii intr-o componenta unica de restul proiectului. Astfel pot administra mai usor aceasta *componenta* pentru a o duce in productie.

### 3. Implementarea chat-ului 📌
### 4. Implementarea aplicatiei IA 📌
### 5. Configurare kubernetes 📌
### 6. Testare 📌
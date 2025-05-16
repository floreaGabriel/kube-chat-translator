# Kubernetes Multi-Component Web Application

A comprehensive web platform deployed on Kubernetes, featuring a content management system, real-time chat application, and AI-powered features.

## 🌟 Project Overview

This project demonstrates a microservices architecture deployed on Kubernetes. It consists of three main components:

1. **Content Management System (Joomla)** - A complete website with database backend
2. **Real-time Chat System** - Featuring .NET Core backend and React frontend
3. **AI Application** - Using Azure cognitive services for speech translation and data storage

All components are containerized and orchestrated with Kubernetes, making the application scalable, resilient, and maintainable.

## 🏗️ Architecture

### CMS Component
- **Frontend**: Joomla CMS with 6 replicas exposed on port 80
- **Backend**: MySQL database for content storage
- **Features**: Content management, templating, user management

### Chat Component
- **Frontend**: React application with 1 replica exposed on port 90
- **Backend**: .NET Core with SignalR for real-time communication (3 replicas exposed on port 88)
- **Database**: MongoDB for message storage
- **Proxy**: NGINX for routing and load balancing

### AI Component
- **Frontend**: React application with 1 replica
- **Services**: 
  - Azure Speech Translation for audio processing
  - Azure Blob Storage for file storage
  - Azure SQL Database for data persistence

## 🚀 Getting Started

### Prerequisites

- Docker Desktop
- Minikube or other Kubernetes cluster
- kubectl
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd proiect-kubernetes
   ```

2. Start your Kubernetes cluster:
   ```bash
   minikube start
   ```

3. Deploy the CMS component:
   ```bash
   kubectl apply -f yamls/cms/
   ```

4. Deploy the Chat component:
   ```bash
   kubectl apply -f yamls/chat/
   ```

5. Deploy the AI component:
   ```bash
   kubectl apply -f yamls/ia/
   ```

6. Verify the deployments:
   ```bash
   kubectl get all
   ```

## 🔧 Component Details

### CMS (Joomla)

The CMS is based on Joomla, a PHP-based content management system. It's deployed with:

- Custom Docker images for Joomla and MySQL
- Persistent volume claims for database storage
- Kubernetes secrets for sensitive configuration
- Services and ingress for external access

Access the CMS at: http://[cluster-ip]/

### Chat System

The chat system provides real-time communication capabilities:

- **Backend**: Built with ASP.NET Core and SignalR for WebSocket communication
- **Frontend**: React application with real-time message display
- **Features**:
  - Persistent message history
  - Real-time message delivery
  - User presence indication

Access the chat interface at: http://[cluster-ip]:90/

### AI Application

The AI component leverages Azure services for speech processing:

- Speech-to-text and translation capabilities
- Secure storage of processed data
- Integration with the main application

## 🔍 Kubernetes Configuration

The project uses various Kubernetes resources:

- **Deployments**: For managing replica sets of pods
- **Services**: For internal and external communication
- **ConfigMaps**: For non-sensitive configuration
- **Secrets**: For sensitive data like database credentials

## 🛠️ Development and Deployment Workflow

1. Develop and test components locally using Docker Compose
2. Build and push Docker images to container registry
3. Update Kubernetes YAML files with new image versions
4. Apply changes to Kubernetes cluster
5. Verify deployments and monitor performance

## 📊 Monitoring and Maintenance

- Use Kubernetes dashboard for cluster monitoring
- Check logs with `kubectl logs [pod-name]`
- Monitor pod health with `kubectl get pods`
- Update deployments with `kubectl apply -f [updated-yaml]`

## 🔒 Security Considerations

- All sensitive information is stored in Kubernetes secrets
- Network policies control inter-service communication
- Services are exposed only through controlled endpoints
- SSL/TLS encryption for external access

## 🧪 Testing

- Unit tests for each microservice
- Integration tests for service interactions
- End-to-end tests for user scenarios

## 👥 Contributors

- [Florea Cristian Gabriel]

## 🙏 Acknowledgements

- Kubernetes Community
- Docker Community
- Microsoft Azure
- Joomla CMS

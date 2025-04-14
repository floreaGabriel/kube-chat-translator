-- Crearea bazei de date dacă nu există
CREATE DATABASE IF NOT EXISTS pizzeria_db;
USE pizzeria_db;

-- Crearea utilizatorului Joomla cu drepturi asupra bazei de date
CREATE USER IF NOT EXISTS 'joomla'@'%' IDENTIFIED BY 'parola_joomla';
GRANT ALL PRIVILEGES ON pizzeria_db.* TO 'joomla'@'%';
FLUSH PRIVILEGES;

-- Crearea tabelei pizza_products conform structurii exacte din dump
DROP TABLE IF EXISTS `pizza_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pizza_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Inserarea datelor în tabela pizza_products
LOCK TABLES `pizza_products` WRITE;
/*!40000 ALTER TABLE `pizza_products` DISABLE KEYS */;
INSERT INTO `pizza_products` VALUES 
(1,'Pizza Margherita','Roșii proaspete, mozzarella, busuioc',25.00,'/images/pizzas/pizza_margherita.jpeg','2025-04-07 14:51:40'),
(2,'Pizza Quattro Formaggi','Mozzarella, gorgonzola, parmezan, brie',30.00,'/images/pizzas/pizza_quatro_formagi.jpeg','2025-04-07 14:51:40'),
(3,'Pizza Diavola','Salam picant, mozzarella, sos iute',28.00,'/images/pizzas/pizza_diavola.jpeg','2025-04-07 14:51:40'),
(4,'Pizza Prosciutto e Funghi','Sos de roșii, mozzarella, șuncă, ciuperci',27.00,'/images/pizzas/pizza_prosciutto_funghi.jpeg','2025-04-08 14:59:22'),
(5,'Pizza Capricciosa','Sos de roșii, mozzarella, șuncă, ciuperci, anghinare, măsline',32.00,'/images/pizzas/pizza_capricciosa.jpeg','2025-04-08 14:59:22'),
(6,'Pizza Vegetariana','Sos de roșii, mozzarella, ardei, ciuperci, porumb, măsline, roșii',26.00,'/images/pizzas/pizza_vegetariana.jpeg','2025-04-08 14:59:22'),
(7,'Pizza Tonno','Sos de roșii, mozzarella, ton, ceapă, măsline',29.00,'/images/pizzas/pizza_tonno.jpeg','2025-04-08 14:59:22'),
(8,'Pizza Hawaii','Sos de roșii, mozzarella, șuncă, ananas',28.00,'/images/pizzas/pizza_hawaii.jpeg','2025-04-08 14:59:22');
/*!40000 ALTER TABLE `pizza_products` ENABLE KEYS */;
UNLOCK TABLES;   
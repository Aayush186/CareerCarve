CREATE TABLE `students` (
  `rollno` int NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`rollno`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `mentors` (
  `mentorId` int NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`mentorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `payment_types` (
  `payment_type_id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`payment_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `payment_type_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `fk_payment_type` (`payment_type_id`),
  CONSTRAINT `fk_payment_type` FOREIGN KEY (`payment_type_id`) REFERENCES `payment_types` (`payment_type_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rollno` int DEFAULT NULL,
  `mentorId` int DEFAULT NULL,
  `time_slot` datetime DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `premium` varchar(20) DEFAULT NULL,
  `session_slot_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rollno` (`rollno`),
  KEY `mentorId` (`mentorId`),
  KEY `session_slot_id` (`session_slot_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`rollno`) REFERENCES `students` (`rollno`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`mentorId`) REFERENCES `mentors` (`mentorId`),
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`session_slot_id`) REFERENCES `session_slot` (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `session_slot` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `mentorId` int DEFAULT NULL,
  `time_from` varchar(100) DEFAULT NULL,
  `time_to` varchar(100) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `duration` int DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

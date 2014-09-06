CREATE TABLE `cei`.`Careers` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

CREATE TABLE `cei`.`Subjects` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `careerid` int(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `careeirid_idx` (`careerid`),
  CONSTRAINT `careeirid` FOREIGN KEY (`careerid`) REFERENCES `careers` (`id`) ON
 DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
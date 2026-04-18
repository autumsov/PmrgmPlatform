-- Database: db_toko
-- Exported on: 2026-04-18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Table structure for table `barang`
--

CREATE TABLE IF NOT EXISTS `barang` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_barang` varchar(100) NOT NULL,
  `harga` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `barang`
--

INSERT INTO `barang` (`id`, `nama_barang`, `harga`) VALUES
(1, 'Laptop ASUS ROG', 15000000),
(2, 'Mouse Logitech M280', 150000),
(3, 'Keyboard Mechanical Rexus', 350000),
(4, 'Monitor Samsung 24 Inch', 1200000);

COMMIT;

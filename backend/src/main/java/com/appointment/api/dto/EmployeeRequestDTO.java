package com.appointment.api.dto;

import lombok.Data;
import java.util.List;

@Data
public class EmployeeRequestDTO {
    // User sınıfından gelen temel bilgiler
    private String name;
    private String email;
    private String password; 
    
    // İlişkisel ID'ler
    private Long companyId;  // Zorunlu (Hata almamak için)
    private Long managerId;  // Opsiyonel
    
    // Çoklu seçim: Çalışanın verebileceği hizmetlerin ID listesi
    private List<Long> serviceIds; 
}
package com.appointment.api.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

@Data
public class EmployeeRequestDTO {
    // User sınıfından gelen temel bilgiler
    @NotBlank(message = "İsim alanı zorunludur")
    @Size(min = 2, max = 100, message = "İsim 2 ile 100 karakter arasında olmalıdır")
    private String name;

    @NotBlank(message = "E-posta alanı zorunludur")
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String email;

    // Şifre: Oluştururken zorunlu, güncellerken opsiyonel (Service katmanında
    // kontrol edilecek)
    @Size(min = 8, message = "Şifre en az 8 karakter olmalıdır")
    private String password;

    // İlişkisel ID'ler
    private Long companyId; // Zorunlu (Hata almamak için)

    private Long managerId; // Opsiyonel

    // Çoklu seçim: Çalışanın verebileceği hizmetlerin ID listesi
    private List<Long> serviceIds;

    // Çalışma Saatleri (İsteğe bağlı)
    private List<WorkingShiftRequestDTO> schedule;
}
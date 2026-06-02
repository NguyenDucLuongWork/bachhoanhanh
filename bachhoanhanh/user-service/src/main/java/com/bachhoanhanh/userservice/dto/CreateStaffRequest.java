package com.bachhoanhanh.userservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateStaffRequest {
    @NotBlank(message = "Username không được để trống")
    private String username; // Thêm trường này để hết lỗi logic

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @NotBlank(message = "Họ không được để trống")
    private String lastName;

    @NotBlank(message = "Tên không được để trống")
    private String firstName;

    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotNull(message = "Ngày sinh không được để trống")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Số CCCD không được để trống")
    private String idCardNumber;

    private String address;
    private boolean isFemale;
}
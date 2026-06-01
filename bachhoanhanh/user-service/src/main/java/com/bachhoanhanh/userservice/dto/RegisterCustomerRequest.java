package com.bachhoanhanh.userservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterCustomerRequest {

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @NotBlank(message = "Họ không được để trống")
    @Size(min = 1, max = 50)
    private String lastName;

    @NotBlank(message = "Tên không được để trống")
    @Size(min = 1, max = 50)
    private String firstName;

    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    private String password;
}
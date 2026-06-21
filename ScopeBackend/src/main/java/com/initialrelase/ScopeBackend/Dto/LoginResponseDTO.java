package com.initialrelase.ScopeBackend.Dto;

public record LoginResponseDTO(String message,String jwtToken,CustomerDTO customerDTO) {
}

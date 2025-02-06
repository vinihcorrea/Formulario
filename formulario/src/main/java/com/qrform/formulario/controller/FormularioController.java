package com.qrform.formulario.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Permite acesso de qualquer origem
public class FormularioController {

    @PostMapping("/enviar")
    public String enviarDados(@RequestBody DadosFormulario dados) {
        System.out.println("Nome: " + dados.getNome());
        System.out.println("CPF: " + dados.getCpf());
        return "Dados recebidos com sucesso!";
    }
}

class DadosFormulario {
    private String nome;
    private String cpf;

    // Getters e Setters
    public String getNome() { 
        return nome; 
    }

    public void setNome(String nome) { 
        this.nome = nome; 
    }

    public String getCpf() { 
        return cpf; 
    }

    public void setCpf(String cpf) { 
        this.cpf = cpf; 
    }
}

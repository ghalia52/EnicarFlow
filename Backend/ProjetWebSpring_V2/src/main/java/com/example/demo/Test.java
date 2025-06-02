package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@SpringBootApplication
@EnableAspectJAutoProxy
public class Test {

	public static void main(String[] args) {
		 SpringApplication.run(Test.class, args);
	        System.out.println("Application Spring Boot démarrée !");

	}

}

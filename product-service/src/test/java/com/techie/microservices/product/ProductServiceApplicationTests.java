package com.techie.microservices.product;

import com.techie.microservices.product.model.Product;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.testcontainers.containers.MongoDBContainer;
import static org.hamcrest.Matchers.*;

@Import(TestcontainersConfiguration.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProductServiceApplicationTests {

	@ServiceConnection
	static MongoDBContainer mongoDBContainer =  new MongoDBContainer("mongo:7.0.5");

	@LocalServerPort
	private Integer port;

	@BeforeEach
	void setUp(){
		RestAssured.baseURI = "http://localhost";
		RestAssured.port = port;
	}

	static {
		mongoDBContainer.start();
	}


	@Test
	void shouldCreateProduct() {
//		Product product = new Product();
		String requestBody = """
				{
				    "name": "Iphone 15",
				    "description": "a mobile phone",
				    "price": 12000
				}
				""";
		RestAssured.given()
				.contentType("application/json")
				.body(requestBody)
				.when()
				.post("/api/products")
				.then()
				.statusCode(HttpStatus.CREATED.value());

	}

}

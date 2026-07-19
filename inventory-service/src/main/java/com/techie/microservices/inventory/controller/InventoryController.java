package com.techie.microservices.inventory.controller;

import com.techie.microservices.inventory.dto.InventoryRequest;
import com.techie.microservices.inventory.dto.InventoryResponse;
import com.techie.microservices.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping(params = {"skuCode", "quantity"})
    @ResponseStatus(HttpStatus.OK)
    public boolean isInStock(@RequestParam String skuCode, @RequestParam Integer quantity) {
        return inventoryService.isInStock(skuCode, quantity);
    }

    @GetMapping(params = "skuCodes")
    @ResponseStatus(HttpStatus.OK)
    public List<InventoryResponse> getQuantities(@RequestParam List<String> skuCodes) {
        return inventoryService.getQuantities(skuCodes);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InventoryResponse addStock(@RequestBody InventoryRequest inventoryRequest) {
        return inventoryService.addStock(inventoryRequest);
    }
}
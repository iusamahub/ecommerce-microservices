package com.techie.microservices.inventory.service;

import com.techie.microservices.inventory.dto.InventoryRequest;
import com.techie.microservices.inventory.dto.InventoryResponse;
import com.techie.microservices.inventory.model.Inventory;
import com.techie.microservices.inventory.repository.InventoryRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;

    @Transactional(readOnly = true)
    public boolean isInStock(String skuCode, Integer quantity) {
        return inventoryRepository.existsBySkuCodeAndQuantityIsGreaterThanEqual(skuCode, quantity);
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getQuantities(List<String> skuCodes) {
        return inventoryRepository.findBySkuCodeIn(skuCodes).stream()
                .map(inventory -> new InventoryResponse(inventory.getId(), inventory.getSkuCode(), inventory.getQuantity()))
                .toList();
    }

    @Transactional
    public InventoryResponse addStock(InventoryRequest inventoryRequest) {
        Inventory inventory = inventoryRepository.findBySkuCode(inventoryRequest.skuCode())
                .orElseGet(() -> {
                    Inventory newInventory = new Inventory();
                    newInventory.setSkuCode(inventoryRequest.skuCode());
                    newInventory.setQuantity(0);
                    return newInventory;
                });
        inventory.setQuantity(inventory.getQuantity() + inventoryRequest.quantity());
        inventoryRepository.save(inventory);
        return new InventoryResponse(inventory.getId(), inventory.getSkuCode(), inventory.getQuantity());
    }
}

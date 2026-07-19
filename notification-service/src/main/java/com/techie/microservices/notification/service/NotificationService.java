package com.techie.microservices.notification.service;

import com.techie.microservices.order.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender javaMailSender;

    @KafkaListener(topics = "order-placed")
    public void listen(OrderPlacedEvent orderPlacedEvent) {
        log.info("Got message from order-placed topic: {}", orderPlacedEvent);

        MimeMessagePreparator messagePreparator = mimeMessage -> {
            mimeMessage.setFrom("no-reply@techie-store.com");
            mimeMessage.setRecipients(jakarta.mail.Message.RecipientType.TO, orderPlacedEvent.getEmail());
            mimeMessage.setSubject(String.format("Your order with orderId %s is placed successfully", orderPlacedEvent.getOrderNumber()));
            mimeMessage.setText(String.format("""
                    Hi %s %s,

                    Your order with orderId %s has been placed successfully.

                    Thank you for shopping with us!
                    """,
                    orderPlacedEvent.getFirstName(), orderPlacedEvent.getLastName(), orderPlacedEvent.getOrderNumber()),
                    StandardCharsets.UTF_8.name());
        };

        try {
            javaMailSender.send(messagePreparator);
            log.info("Order notification email sent for orderId: {}", orderPlacedEvent.getOrderNumber());
        } catch (MailException e) {
            log.error("Exception occurred when sending mail for orderId: {}", orderPlacedEvent.getOrderNumber(), e);
            throw new RuntimeException("Exception occurred when sending mail to " + orderPlacedEvent.getEmail(), e);
        }
    }
}

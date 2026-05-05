package com.bachhoanhanh.productservice.model;

import java.util.Objects;

public class Attribute {
    public String name;
    public AttributeType Type;
    public String value;

    public Attribute(String name, AttributeType type, String value) {
        this.name = name;
        Type = type;
        this.value = value;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AttributeType getType() {
        return Type;
    }

    public void setType(AttributeType type) {
        Type = type;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Attribute attribute = (Attribute) o;
        return Objects.equals(name, attribute.name);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(name);
    }

    @Override
    public String toString() {
        return "Attribute{" +
                "name='" + name + '\'' +
                ", Type=" + Type +
                ", value='" + value + '\'' +
                '}';
    }
}
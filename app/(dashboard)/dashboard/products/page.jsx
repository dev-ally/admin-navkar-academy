"use client";

import React, { useState, useEffect } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/firebase/config";
import { LoaderCircle } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard"; // Ensure the ProductCard import is included
import Dropdown from "@/components/shared/Dropdown"; // Ensure the Dropdown import is included
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DisplayProducts = ({ selectedClass, selectedSubject }) => {
  const [productsData, setProductsData] = useState(null);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, "products"), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProductsData(data);
      } else {
        setProductsData({});
      }
    });

    return () => unsubscribe();
  }, []);

  if (productsData === null) {
    return (
      <h1 className="font-medium py-2 text-center text-2xl flex items-center gap-2 mb-6 md:mb-8">
        <LoaderCircle className="animate-spin" />
        Loading Products
      </h1>
    );
  }

  // Prepare classes and subjects
  const classesWithSubjects = Object.entries(productsData).map(
    ([classKey, subjects]) => ({
      class: classKey,
      subjects: Object.keys(subjects).map((subjectKey) => ({
        subject: subjectKey,
        notes: Object.keys(subjects[subjectKey]), // Include notes if needed
      })),
    })
  );

  // Filter products based on selected class and subject
  const filteredProducts = () => {
    if (!selectedClass && !selectedSubject) {
      // No filters applied, return all products
      return Object.entries(productsData).flatMap(([groupKey, categoryGroup]) =>
        Object.entries(categoryGroup).flatMap(([categoryKey, productList]) =>
          Object.entries(productList).map(([productId, product]) => ({
            productId,
            product,
          }))
        )
      );
    }

    // Filter by selected class and/or subject
    return Object.entries(productsData).flatMap(([groupKey, categoryGroup]) =>
      Object.entries(categoryGroup).flatMap(([categoryKey, productList]) =>
        Object.entries(productList)
          .filter(([productId, product]) => {
            const matchesClass =
              !selectedClass ||
              selectedClass === "All Classes" ||
              product.pclass === selectedClass; // Adjust for "All Classes"
            const matchesSubject =
              !selectedSubject ||
              selectedSubject === "All Subjects" ||
              product.psubject === selectedSubject; // Adjust for "All Subjects"
            return matchesClass && matchesSubject;
          })
          .map(([productId, product]) => ({
            productId,
            product,
          }))
      )
    );
  };

  const productsToDisplay = filteredProducts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
      {productsToDisplay.length === 0 ? (
        <p className="text-center text-2xl">No Products Available</p>
      ) : (
        productsToDisplay.map(({ productId, product }) => (
          <ProductCard
            key={productId}
            pid={product.pid}
            ptitle={product.ptitle}
            pdescription={product.pdescription}
            pcoverImg={product.pcoverImg}
            pclass={product.pclass}
            psubject={product.psubject}
            pprice={product.pprice}
            pcreatedAt={product.pcreatedAt}
          />
        ))
      )}
    </div>
  );
};

const Page = () => {
  const [productsData, setProductsData] = useState(null);
  const [selectedClass, setSelectedClass] = useState("All Classes"); // Set default to "All Classes"
  const [selectedSubject, setSelectedSubject] = useState("All Subjects"); // Set default to "All Subjects"
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, "products"), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProductsData(data);
      } else {
        setProductsData({});
      }
    });

    return () => unsubscribe();
  }, []);

  // Prepare classes and subjects
  const classesWithSubjects = productsData
    ? Object.entries(productsData).map(([classKey, subjects]) => ({
        class: classKey,
        subjects: Object.keys(subjects).map((subjectKey) => ({
          subject: subjectKey,
        })),
      }))
    : [];

  const handleClassChange = (className) => {
    setSelectedClass(className === "All Classes" ? null : className); // Adjust for "All Classes"
    const selectedClassObj =
      className !== "All Classes"
        ? classesWithSubjects.find((c) => c.class === className)
        : null;
    setFilteredSubjects(
      selectedClassObj ? selectedClassObj.subjects.map((s) => s.subject) : []
    );
    setSelectedSubject(null); // Reset selected subject when class changes
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject === "All Subjects" ? null : subject); // Adjust for "All Subjects"
  };

  return (
    <Container>
      <div className="my-10 flex flex-col px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="font-bold text-center text-3xl md:text-4xl flex items-center gap-2 mb-6 md:mb-0">
            Your Products.
          </h1>
          <Button asChild>
            <Link href="/dashboard/products/0/0/add">Add Product</Link>
          </Button>
        </div>
        <div className="flex gap-4 mb-6">
          <Select onValueChange={handleClassChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Classes">All Classes</SelectItem>
              {classesWithSubjects
                .map((c) => c.class)
                .map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select onValueChange={handleSubjectChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Subjects">All Subjects</SelectItem>
              {filteredSubjects.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <DisplayProducts
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
          />
        </div>
        {/* <div className="flex gap-4">
          <Dropdown
            trigger="Class"
            options={classesWithSubjects.map((c) => c.class)}
            onChange={handleClassChange}
            className="w-[180px]"
          />
          <Dropdown
            trigger="Subject"
            options={filteredSubjects}
            onChange={handleSubjectChange}
            className="w-[180px]"
          />
        </div> */}
      </div>
    </Container>
  );
};

export default Page;

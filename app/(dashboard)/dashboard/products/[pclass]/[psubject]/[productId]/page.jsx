"use client";

import addProductToDB from "@/actions/products/addProductToDB";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { db, storage } from "@/firebase/config";
import { onValue, ref as refDB, update } from "firebase/database";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const ProductPage = () => {
  const [productData, setProductData] = useState({
    pid: "",
    ptitle: "",
    pdescription: "",
    pcoverImg: "",
    pdownloadCoverUrl: "",
    ppdf: "",
    pdownloadPdfUrl: "",
    pclass: "",
    psubject: "",
    pprice: "",
    pcreatedAt: new Date().toISOString().split("T")[0],
  });
  const [addingProduct, setAddingProduct] = useState(false);

  const { pclass, psubject, productId } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (productId !== "add") {
      const fetchProductData = async () => {
        const productRef = refDB(db, "products/" + pclass + "/" + decodeURIComponent(psubject) + "/" + productId);
        onValue(productRef, (snapshot) => {
          const data = snapshot.val();
          console.log("DATA", data);

          // if (!data) {
          //   toast.error("Product not found");
          //   router.push("/dashboard/products");
          //   return;
          // }
          setProductData(data);
        });

        const noteRef = refDB(db, "notes/" + productId);

        onValue(noteRef, (snapshot) => {
          const data = snapshot.val();
          console.log("NOTE DATA", data);
          setProductData({ ...productData, ppdf: data?.ppdf });
        })
      };
      fetchProductData();
    }
  }, [productId, router, pclass, psubject, productData]);

  // const productActionHandler = async (e) => {
  //   e.preventDefault();
  //   console.log("PRODUCT ACTION HANDLER");
  //   console.log("PRODUCTDATA", productData);

  //   if (productId !== "add") {
  //     const loading = toast.loading("Updating Product...");
  //     setAddingProduct(true);
  //     console.log("UPDATING");
  //     console.log("PRODUCTDATA", productData);
  //     try {
  //       await update(refDB(db, `products/${productId}`), {
  //         ...productData,
  //       });
  //       toast.success("Product updated successfully!", {
  //         id: loading,
  //       });
  //       router.push("/dashboard/products");
  //     } catch (error) {
  //       console.error("Error updating product:", error);
  //       toast.error("Failed to update product. Please try again.", {
  //         id: loading,
  //       });
  //     } finally {
  //       setAddingProduct(false);
  //     }
  //     return;
  //   }

  //   const loading = toast.loading("Adding Product: 00.00%");
  //   setAddingProduct(true);

  //   if (
  //     productData.pcoverImg === "" ||
  //     productData.ppdf === "" ||
  //     productData.ptitle === "" ||
  //     productData.pdescription === "" ||
  //     productData.pclass === "" ||
  //     productData.psubject === "" ||
  //     productData.pprice === ""
  //   ) {
  //     toast.error("Please fill all the fields", {
  //       id: loading,
  //     });
  //     return;
  //   }

  //   if (productData?.pcoverImg.size > 5000000) {
  //     toast.error("Please upload an image smaller than 5MB", {
  //       id: loading,
  //     });
  //     setAddingProduct(false);
  //     return;
  //   }

  //   if (productData?.ppdf.type !== "application/pdf") {
  //     toast.error("Please upload a PDF file", {
  //       id: loading,
  //     });
  //     setAddingProduct(false);
  //     return;
  //   }

  //   const newProductId = uuidv4();

  //   setProductData({
  //     ...productData,
  //     pid: newProductId,
  //   });

  //   console.log("PCOVERIMG", productData.pcoverImg);

  //   const storageRef = ref(storage, `products/${newProductId}`);
  //   const uploadTask = uploadBytesResumable(storageRef, productData.pcoverImg);

  //   uploadTask.on(
  //     "state_changed",
  //     (snapshot) => {
  //       const progress =
  //         (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //       console.log("Upload is " + progress + "% done");
  //       toast.loading(`Adding Product: ${progress.toFixed(2)}%`, {
  //         id: loading,
  //       });
  //       switch (snapshot.state) {
  //         case "paused":
  //           console.log("Upload is paused");
  //           break;
  //         case "running":
  //           console.log("Upload is running");
  //           break;
  //       }
  //     },
  //     (error) => {
  //       // Handle unsuccessful uploads
  //       toast.error("Failed to upload image. Please try again.", {
  //         id: loading,
  //       });
  //       setAddingProduct(false); // Reset addingEvent if upload fails
  //     },
  //     async () => {
  //       // Handle successful uploads on complete
  //       await getDownloadURL(uploadTask.snapshot.ref).then(
  //         async (downloadURL) => {
  //           console.log("File available at", downloadURL);
  //           setProductData((prevData) => ({
  //             ...prevData,
  //             pdownloadCoverUrl: downloadURL,
  //           }));

  //           // Add the event to the database once the download URL is available
  //           const addDataToDb = await addProductToDB({
  //             pid: newProductId,
  //             ptitle: productData.ptitle,
  //             pdescription: productData.pdescription,
  //             pcoverImg: downloadURL,
  //             pclass: productData.pclass,
  //             psubject: productData.psubject,
  //             pprice: productData.pprice,
  //             pcreatedAt: productData.pcreatedAt,
  //           });

  //           console.log("ADD DATA TO DB", addDataToDb);

  //           if (addDataToDb) {
  //             toast.success("Product added successfully!", {
  //               id: loading,
  //             });

  //             router.push("/dashboard/products"); // Redirect to events page after successful addition
  //           } else {
  //             toast.error("Failed to add product. Please try again later.", {
  //               id: loading,
  //             });
  //           }

  //           setAddingProduct(false); // Reset addingEvent after successful addition
  //         }
  //       );
  //     }
  //   );

  //   // Clear the form after adding the event
  //   setProductData({
  //     ptitle: "",
  //     pdescription: "",
  //     pcoverImg: "",
  //     pclass: "",
  //     psubject: "",
  //     pprice: "",
  //   });
  // };

  const productActionHandler = async (e) => {
    e.preventDefault();
    console.log("PRODUCT ACTION HANDLER");
    console.log("PRODUCTDATA", productData);

    if (productId !== "add") {
      const loading = toast.loading("Updating Product...");
      setAddingProduct(true);
      console.log("UPDATING");
      console.log("PRODUCTDATA", productData);
      try {
        await update(refDB(db, `products/${productId}`), {
          ...productData,
        });
        toast.success("Product updated successfully!", {
          id: loading,
        });
        router.push("/dashboard/products");
      } catch (error) {
        console.error("Error updating product:", error);
        toast.error("Failed to update product. Please try again.", {
          id: loading,
        });
      } finally {
        setAddingProduct(false);
      }
      return;
    }

    const loading = toast.loading("Uploading Assets: 00.00%");
    setAddingProduct(true);

    if (
      productData.pcoverImg === "" ||
      productData.ppdf === "" ||
      productData.ptitle === "" ||
      productData.pdescription === "" ||
      productData.pclass === "" ||
      productData.psubject === "" ||
      productData.pprice === ""
    ) {
      toast.error("Please fill all the fields", {
        id: loading,
      });
      setAddingProduct(false);
      return;
    }

    if (productData?.pcoverImg.size > 5000000) {
      toast.error("Please upload an image smaller than 5MB", {
        id: loading,
      });
      setAddingProduct(false);
      return;
    }

    if (productData?.ppdf.type !== "application/pdf") {
      toast.error("Please upload a PDF file", {
        id: loading,
      });
      setAddingProduct(false);
      return;
    }

    const newProductId = uuidv4();

    const uploadFileToStorage = (file, fileName) => {
      return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            toast.loading(`Uploading Assets: ${progress.toFixed(2)}%`, {
              id: loading,
            });
          },
          (error) => {
            console.error("Error uploading file:", error);
            reject(error);
          },
          async () => {
            // File uploaded successfully, get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    };

    try {
      // Upload both image and PDF and get their download URLs
      const [coverImgUrl, pdfUrl] = await Promise.all([
        uploadFileToStorage(
          productData.pcoverImg,
          `products/${newProductId}_coverImage`
        ),
        uploadFileToStorage(
          productData.ppdf,
          `products/${newProductId}_pdfFile`
        ),
      ]);

      setProductData((prevData) => ({
        ...prevData,
        pdownloadCoverUrl: coverImgUrl,
        pdownloadPdfUrl: pdfUrl,
      }));
      const localData = {
        data: {
          pid: newProductId,
          ptitle: productData.ptitle,
          pdescription: productData.pdescription,
          pcoverImg: coverImgUrl,
          pclass: productData.pclass,
          psubject: productData.psubject,
          pprice: productData.pprice,
          pcreatedAt: new Date().toISOString().split("T")[0],
        }
      }
      console.log("LOCALDATA", localData)

      // Once both URLs are available, add the product to the database
      const addDataToDb = await addProductToDB({
        data: {
          pid: newProductId,
          ptitle: productData.ptitle,
          pdescription: productData.pdescription,
          pcoverImg: coverImgUrl,
          pclass: productData.pclass,
          psubject: productData.psubject,
          pprice: productData.pprice,
          pcreatedAt: new Date().toISOString().split("T")[0],
        },
        reference: `products/${productData.pclass.toString()}/${productData?.psubject.toString()}/${newProductId}`,
      });
      const addPdfUrlToDb = await addProductToDB({
        data: {
          pid: newProductId,
          ppdf: pdfUrl,
        },
        reference: `notes/${newProductId}`,
      });

      if (addDataToDb && addPdfUrlToDb) {
        toast.success("Product added successfully!", {
          id: loading,
        });
        router.push("/dashboard/products");
      } else {
        toast.error("Failed to add product. Please try again later.", {
          id: loading,
        });
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product. Please try again.", {
        id: loading,
      });
    } finally {
      setAddingProduct(false);
    }

    // Clear the form after adding the product
    setProductData({
      ptitle: "",
      pdescription: "",
      pcoverImg: "",
      ppdf: "",
      pclass: "",
      psubject: "",
      pprice: "",
    });
  };

  return (
    <Container>
      <div className="flex justify-center items-center w-full py-6">
        <div className="w-full md:w-[80%] lg:w-[60%]">
          <h2 className="text-3xl font-bold mb-6">
            {productId === "add" ? "Add Product" : "Update Product"}.
          </h2>
          <form onSubmit={productActionHandler}>
            {/* Image Input */}
            <div className="flex justify-center items-center w-full">
              {productId !== "add" && productData?.pcoverImg && (
                <div className="max-h-[200px] rounded-md w-full flex justify-center items-center flex-col">
                  <Image
                    src={productData.pcoverImg}
                    width={1000}
                    height={1000}
                    alt="Product Image"
                    className="w-full min-h-[240px] object-contain"
                  />
                </div>
              )}
              {productId !== "add" && productData?.ppdf && (
                <div className="max-h-[240px] rounded-md w-full flex justify-center items-center flex-col">
                  <iframe
                    src={productData.ppdf}
                    alt="Product Image"
                    className="w-full min-h-[240px] object-contain"
                  />
                </div>
              )}
              {productId === "add" && (
                <div className="flex flex-col gap-6 w-full">
                  {productData?.pcoverImg ? (
                    <div className="min-h-[200px] rounded-md px-6 py-8 bg-emerald-400/40 w-full flex flex-col md:flex-row justify-center items-center gap-8 cursor-pointer">
                      <Image
                        src={URL.createObjectURL(productData.pcoverImg)}
                        width={1000}
                        height={1000}
                        alt="Product Image"
                        className="w-fit max-h-[200px] object-contain"
                      />
                      <div className="flex flex-col gap-2 justify-center">
                        <span className="text-xl font-bold my-4">
                          Image Uploaded Successfully
                        </span>
                        <button
                          className="px-4 py-2 border-2 border-black hover:bg-black/80 hover:text-white transition-all duration-300 ease-in-out rounded-full"
                          onClick={(e) => {
                            e.preventDefault();
                            setProductData({ ...productData, pcoverImg: "" });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <label
                        htmlFor="productImage"
                        className="w-full border-2 rounded-md border-orange-400/80 bg-orange-400/20 flex flex-col gap-2 justify-center items-center px-10 h-[200px] cursor-pointer"
                      >
                        <span className="text-xl font-bold">Upload Image</span>
                        <span className="text-sm text-black/50 font-semibold">
                          Click here to upload image!
                        </span>
                        <span className="text-sm text-black/50 font-semibold">
                          Landscape Orientation (1000 x 700)
                        </span>
                      </label>
                      <input
                        type="file"
                        id="productImage"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          console.log(e.target.files[0]);
                          setProductData({
                            ...productData,
                            pcoverImg: e.target.files[0],
                          });
                        }}
                      />
                    </>
                  )}
                  {productData?.ppdf ? (
                    <div className="min-h-[200px] rounded-md px-6 py-8 bg-emerald-400/40 w-full flex flex-col md:flex-row justify-center items-center gap-8 cursor-pointer">
                      {/* <Image
                        src={URL.createObjectURL(productData.ppdf)}
                        width={1000}
                        height={1000}
                        alt="Product PDF"
                        className="w-fit max-h-[200px] object-contain"
                      /> */}
                      <iframe
                        src={URL.createObjectURL(productData.ppdf)}
                        className="w-fit max-h-[200px]"
                      ></iframe>
                      <div className="flex flex-col gap-2 justify-center">
                        <span className="text-xl font-bold my-4">
                          PDF Uploaded Successfully
                        </span>
                        <button
                          className="px-4 py-2 border-2 border-black hover:bg-black/80 hover:text-white transition-all duration-300 ease-in-out rounded-full"
                          onClick={(e) => {
                            e.preventDefault();
                            setProductData({ ...productData, ppdf: "" });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <label
                        htmlFor="productPdf"
                        className="w-full border-2 rounded-md border-orange-400/80 bg-orange-400/20 flex flex-col gap-2 justify-center items-center px-10 h-[200px] cursor-pointer"
                      >
                        <span className="text-xl font-bold">Upload PDF</span>
                        <span className="text-sm text-black/50 font-semibold">
                          Click here to upload PDF!
                        </span>
                        <span className="text-sm text-black/50 font-semibold">
                          Landscape Orientation (1000 x 700)
                        </span>
                      </label>
                      <input
                        type="file"
                        id="productPdf"
                        // accept=""
                        className="hidden"
                        onChange={(e) => {
                          console.log(e.target.files[0]);
                          setProductData({
                            ...productData,
                            ppdf: e.target.files[0],
                          });
                        }}
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Title Input */}
            <div>
              <label
                htmlFor="productTitle"
                className="block text-lg font-semibold mt-6"
              >
                Title
              </label>
              <input
                type="text"
                id="productTitle"
                placeholder="Enter event title"
                className="w-full border-2 border-gray-300 rounded-md p-2"
                value={productData.ptitle}
                onChange={(e) =>
                  setProductData({ ...productData, ptitle: e.target.value })
                }
                required
              />
            </div>

            {/* Date and Time Input */}
            <div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <label
                    htmlFor="productClass"
                    className="block text-lg font-semibold"
                  >
                    Class
                  </label>
                  <input
                    type="number"
                    id="productClass"
                    className="w-full border-2 border-gray-300 rounded-md p-2"
                    placeholder="Enter class"
                    min={2}
                    max={12}
                    value={productData.pclass}
                    onChange={(e) =>
                      setProductData({ ...productData, pclass: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="productSubject"
                    className="block text-lg font-semibold"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="productSubject"
                    className="w-full border-2 border-gray-300 rounded-md p-2"
                    placeholder="Enter subject"
                    value={productData.psubject}
                    onChange={(e) =>
                      setProductData({
                        ...productData,
                        psubject: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Date and Time Input */}
            <div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <label
                    htmlFor="productCreatedDate"
                    className="block text-lg font-semibold"
                  >
                    Created Date
                  </label>
                  <input
                    type="date"
                    id="productCreatedDate"
                    // min={new Date().toISOString().split("T")[0}
                    // set the value as today's date
                    value={productData.pcreatedAt}
                    className="w-full border-2 border-gray-300 rounded-md p-2"
                    disabled
                  // value={eventData.date}
                  // onChange={(e) =>
                  //   setEventData({ ...eventData, date: e.target.value })
                  // }
                  />
                </div>
                <div>
                  <label
                    htmlFor="productPrice"
                    className="block text-lg font-semibold"
                  >
                    Price
                  </label>
                  <input
                    type="number"
                    id="productPrice"
                    className="w-full border-2 border-gray-300 rounded-md p-2"
                    placeholder="Enter price"
                    value={productData.pprice}
                    onChange={(e) =>
                      setProductData({ ...productData, pprice: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label
                htmlFor="productDescription"
                className="block text-lg font-semibold mt-6"
              >
                Description
              </label>
              <textarea
                id="productDescription"
                placeholder="Enter product description"
                className="w-full border-2 border-gray-300 rounded-md p-2 h-[150px]"
                value={productData.pdescription}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    pdescription: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-8 p-3 bg-black text-white hover:bg-gray-800 transition-all duration-300 ease-in-out rounded-md"
            // disabled={addingEvent}
            >
              {addingProduct ? (
                <div className="flex justify-center items-center gap-2">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  {productId === "add" ? "Adding" : "Updating"} Product...
                </div>
              ) : productId === "add" ? (
                "Add Product"
              ) : (
                "Update Product"
              )}
            </Button>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default ProductPage;

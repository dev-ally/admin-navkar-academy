"use client";

import addProductToDB from "@/actions/products/addProductToDB";
import Container from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { db, storage } from "@/firebase/config";
import { onValue, ref as refDB, set, update } from "firebase/database";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  uploadString,
} from "firebase/storage";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

import * as pdfjsLib from "pdfjs-dist/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/legacy/build/pdf.worker.min.mjs`;

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
  const [ppdfPreview, setPpdfPreview] = useState("");
  const [previewNote, setPreviewNote] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [startPage, setStartPage] = useState(0);
  const [endPage, setEndPage] = useState(0);
  const [dStartPage, setDStartPage] = useState(0);
  const [dEndPage, setDEndPage] = useState(0);
  const [pages, setPages] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const { pclass, psubject, productId } = useParams();
  const router = useRouter();

  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    if (productId !== "add") {
      const fetchProductData = async () => {
        const productRef = refDB(
          db,
          `products/${pclass}/${decodeURIComponent(psubject)}/${productId}`
        );
        await onValue(productRef, (snapshot) => {
          const data = snapshot.val();
          // console.log("DATA", data);

          // if (!data) {
          //   toast.error("Product not found");
          //   router.push("/dashboard/products");
          //   return;
          // }
          setProductData(data);
        });

        const noteRef = refDB(db, "notes/" + productId);

        await onValue(noteRef, (snapshot) => {
          const data = snapshot.val();
          // console.log("NOTE DATA", data);
          // Update productData using a functional update to avoid stale closure
          setProductData((prevData) => ({ ...prevData, ppdf: data?.ppdf }));
          // setPpdf(data?.ppdf);
        });
      };
      fetchProductData();
    }
  }, [productId, router, pclass, psubject]); // Removed productData from dependencies

  const productActionHandler = async (e) => {
    e.preventDefault();
    // console.log("PRODUCT ACTION HANDLER");
    // console.log("PRODUCTDATA", productData);

    if (productId !== "add") {
      const loading = toast.loading("Updating Product...");
      setAddingProduct(true);
      // console.log("UPDATING");
      // console.log("PRODUCTDATA", productData);
      try {
        await update(refDB(db, `products/${pclass}/${psubject}/${productId}`), {
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
      // productData.pcoverImg === "" ||
      productData.ppdf === "" ||
      // ppdf === "" ||
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
            // console.log("Upload is " + progress + "% done");
            toast.loading(`Uploading Note PDF: ${progress.toFixed(2)}%`, {
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

    const uploadImageToStorage = (file, fileName) => {
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
      // Upload all preview images and get their download URLs
      const previewImageUrls = await Promise.all(
        previewNote.map(async (imageData, index) => {
          const imageRef = ref(
            storage,
            `images/${newProductId}_previewImage_${index}.png`
          );
          toast.loading(`Uploading Images: ${index} / ${previewNote?.length}`, {
            id: loading,
          });
          await uploadString(imageRef, imageData, "data_url");
          // console.log(
          //   `Uploaded ${newProductId}_previewImage_${index}.png to Firebase Storage`
          // );
          // uploadedPreviewImages.push(

          // );
          return await getDownloadURL(imageRef).then((url) => url);
        })
      );

      const pdfUrl = await uploadFileToStorage(
        productData.ppdf,
        `products/${newProductId}_pdfFile`
      );
      // console.log("PDF URL", pdfUrl);
      // console.log("PREVIEWIMAGEURLS", previewImageUrls);
      // return;

      const coverImgUrl = previewImageUrls; // Store all preview image URLs

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
        },
      };
      // console.log("LOCALDATA", localData);

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
    // setPpdf("");
  };

  const pdfUploadHandler = async (e) => {
    // console.log(e.target.files[0]);
    setProductData({
      ...productData,
      ppdf: e.target.files[0],
    });
    // setPpdf(e.target.files[0]);
    const uri = URL.createObjectURL(e.target.files[0]);
    setPpdfPreview(uri);
    // console.log("CONVERTING", uri);

    const pdf = await pdfjsLib.getDocument({ url: uri });

    await pdf.promise.then(
      async (_pdf) => {
        // Added async here
        const {
          _pdfInfo: { numPages },
        } = _pdf;
        setPages(numPages);
        setPdfFile(_pdf);
        // Set StartPage and EndPage
        setStartPage(1);
        setEndPage(numPages);
        // console.log("PDF", _pdf);
      },
      (error) => {
        console.log("PDF error :", error);
      }
    );
  };

  // const onConvert = async () => {
  //   const uri = URL.createObjectURL(selectedFile);
  //   console.log("CONVERTING", uri);

  //   const pdf = await pdfjsLib.getDocument({ url: uri });

  //   await pdf.promise.then(
  //     async (_pdf) => {
  //       // Added async here
  //       const {
  //         _pdfInfo: { numPages },
  //       } = _pdf;
  //       setPages(numPages);
  //       setPdfFile(_pdf);
  //       console.log("PDF", _pdf);

  //       // Upload specified range of images to Firebase
  //       for (let i = startPage - 1; i < endPage && i < pages; i++) {
  //         // Adjusted loop for specified range
  //         // const imageRef = ref(storage, `images/page-${i}.png`); // Create a reference for each image
  //         // await uploadString(imageRef, img[i], "data_url"); // Upload the image
  //         console.log(`Uploaded page-${i}.png to Firebase Storage`);
  //       }
  //     },
  //     (error) => {
  //       console.log("PDF error :", error);
  //     }
  //   );
  // };

  const previewNoteHandler = async (e) => {
    e.preventDefault();
    setLoadingPdf(true);
    setPreviewNote(null);
    // check if the dStartPage and dEndPage are in the range of 1 - pages and then store the page image as the array in the previewNote array
    if (dStartPage >= 1 && dEndPage <= pages) {
      for (
        let pageNum = Number(dStartPage);
        pageNum <= Number(dEndPage);
        pageNum++
      ) {
        // console.log(`Previewing page ${pageNum} ${typeof pageNum}`);
        const page = await pdfFile.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement("canvas"); // Create a new canvas for each page
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          enableWebGL: false,
        };
        let renderTask = page.render(renderContext);
        await renderTask.promise;
        setPreviewNote((prev) => [...(prev || []), canvas.toDataURL()]); // Store all images in an array
        // console.log("PREVIEWNOTE", (prev) => [
        //   ...(prev || []),
        //   canvas.toDataURL(),
        // ]);
      }
    } else {
      toast.error("Invalid page range. Please select a valid range.", {
        id: loading,
      });
    }
    setLoadingPdf(false);
  };

  return (
    <Container>
      <div className="flex justify-center items-center w-full py-6">
        <div className="w-full md:w-[80%] lg:w-[60%]">
          <h2 className="text-3xl font-bold mb-6">
            {productId === "add" ? "Add Product" : "Update Product"}.
          </h2>
          {/* <form onSubmit={productActionHandler}> */}
          {/* Image Input */}
          <div className="flex justify-center items-center">
            {productId !== "add" && productData?.pcoverImg && (
              <div className="max-h-[300px] rounded-md w-full my-12 flex justify-center items-center flex-col">
                {/* <Image
                  src={productData.pcoverImg}
                  width={1000}
                  height={1000}
                  alt="Product Image"
                  className="w-full min-h-[240px] object-contain"
                /> */}
                <Carousel
                  plugins={[
                    Autoplay({
                      delay: 2000,
                    }),
                  ]}
                  className="w-[300px] flex justify-center items-center"
                >
                  <CarouselContent>
                    {Array.isArray(productData.pcoverImg) &&
                      productData.pcoverImg.length > 0 &&
                      productData.pcoverImg.map((img) => (
                        <CarouselItem key={img}>
                          <Image
                            src={img}
                            alt="Product Cover Image"
                            width={1000}
                            height={1000}
                            className="max-w-[300px] max-h-[500px] w-fit h-full object-cover rounded-lg md:rounded-l-lg"
                          />
                        </CarouselItem>
                      ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            )}
            {/* {productId !== "add" && ppdf && (
              <div className="max-h-[240px] rounded-md w-full flex justify-center items-center flex-col">
                <iframe
                  src={productData.ppdf}
                  // src={ppdf}
                  alt="Product Image"
                  className="w-full min-h-[240px] object-contain"
                />
              </div>
            )} */}
            {productId === "add" && (
              <div className="flex flex-col gap-6 w-full">
                {productData?.ppdf ? (
                  <div className="min-h-[200px] rounded-md px-6 py-8 bg-emerald-400/40 w-full flex flex-col md:flex-row justify-center items-center gap-8 cursor-pointer">
                    <div className="w-[50%] flex flex-col gap-2 justify-center">
                      <iframe
                        // src={URL.createObjectURL(productData.ppdf)}
                        src={ppdfPreview}
                        className="min-h-[400px] h-full"
                      ></iframe>
                      <button
                        className="mt-4 px-4 py-2 border-2 border-black hover:bg-black/80 hover:text-white transition-all duration-300 ease-in-out rounded-full"
                        onClick={(e) => {
                          e.preventDefault();
                          setProductData({ ...productData, ppdf: "" });
                          // setPpdf("");
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="w-[50%] flex flex-col gap-2 justify-center">
                      <span className="text-xl font-bold mb-4">
                        PDF Uploaded Successfully
                      </span>
                      <span className="text-xl">
                        Preview Images Range:
                        {startPage} - {endPage}
                      </span>
                      <div className="w-full flex gap-4">
                        <input
                          type="number"
                          min={startPage}
                          max={endPage}
                          placeholder="Start Page..."
                          value={dStartPage}
                          onChange={(e) => setDStartPage(e.target.value)}
                          required
                          className="w-[50%] h-[40px] px-4 py-2 bg-transparent border-[3px] border-black rounded-md placeholder:text-black/60"
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="End Page..."
                          value={dEndPage}
                          onChange={(e) => setDEndPage(e.target.value)}
                          required
                          className="w-[50%] h-[40px] px-4 py-2 bg-transparent border-[3px] border-black rounded-md placeholder:text-black/60"
                        />
                      </div>
                      <button
                        onClick={previewNoteHandler}
                        className="mt-4 px-4 py-2 border-2 border-black hover:bg-black/80 hover:text-white transition-all duration-300 ease-in-out rounded-full"
                      >
                        Preview
                      </button>

                      {previewNote && (
                        <>
                          {loadingPdf ? (
                            <div className="flex justify-center items-center text-black my-4">
                              <LoaderCircle className="h-10 w-10 animate-spin" />
                            </div>
                          ) : (
                            <>
                              <Carousel
                                plugins={[
                                  Autoplay({
                                    delay: 3000,
                                  }),
                                ]}
                                setApi={setApi}
                              >
                                <CarouselContent>
                                  {previewNote &&
                                    previewNote.map((img, index) => (
                                      <CarouselItem key={index}>
                                        <Image
                                          src={img}
                                          alt="Preview Image"
                                          width={1000}
                                          height={1000}
                                          className="text-xl font-bold"
                                        />
                                      </CarouselItem>
                                    ))}
                                </CarouselContent>
                              </Carousel>
                              <div className="py-2 text-center text-sm text-muted-foreground">
                                Slide {current} of {previewNote.length}
                              </div>
                            </>
                          )}
                        </>
                      )}
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
                    </label>
                    <input
                      type="file"
                      id="productPdf"
                      // accept=""
                      className="hidden"
                      onChange={pdfUploadHandler}
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
            disabled={addingProduct}
            onClick={productActionHandler}
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
          {/* </form> */}
        </div>
      </div>
    </Container>
  );
};

export default ProductPage;

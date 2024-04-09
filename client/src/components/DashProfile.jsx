import React from "react";
import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button, TextInput, Modal } from "flowbite-react";
import { Alert } from "flowbite-react";
import {HiOutlineExclamationCircle} from "react-icons/hi";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateStart,
  updateFailure,
  updateSuccess,
  deleteUserStart,
  deleteUserFailure,
  deleteUserSuccess,
  signoutSuccess, 
} from "../redux/user/userSlice";

const DashProfile = () => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  // for image upload
  const [imageFile, setImageFile] = useState(null);
  // for converting the image to url for storing
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const filePickerRef = useRef();
  const [imageFileUploadingProgress, setImageFileUploadingProgress] =
    useState(null);
  const [imageFileUploadingError, setImageFileUploadingError] = useState(null);
  const { currentUser, error  } = useSelector((state) => state.user);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file)); // this is going to create a URL for us
    }
  };

  // anytime we have a change in image file, we are going to upload the new image onto firebase file storage
  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  const uploadImage = async () => {
    // at the start of the image upload,
    // we are going to set the image file uploading to true
    // and we are going to set the image file uploading error to null
    setImageFileUploading(true);
    setImageFileUploadingError(null);
    if (imageFile.size > 2 * 1024 * 1024) {
      setImageFileUploadingError("Image size should be less than 2MB");
      return;
    }
    const storage = getStorage(app);
    // we're adding time to making filename unique else we might overwrite the file
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadingProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadingError("could not upload the image");
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploadingProgress(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL); // this is the url of the image
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); //preventing default behavior of form submission which is to refresh the page
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) {
      setUpdateUserError("No changes made");
      return;
    }
    // if the image file is still uploading, we are not going to update the user
    if (imageFileUploading) {
      setUpdateUserError("Image is still uploading");
      return;
    }
    // but if there is something in the form data, we are going to update the user
    try {
      dispatch(updateStart());
      // we are going to update the user
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
        return;
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User Profile updated successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);

    try{

      dispatch(deleteUserStart());

      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      else{
        dispatch(deleteUserSuccess());
      }
      dispatch(deleteUserSuccess());
    }
    catch(err){
      dispatch(deleteUserFailure(err.message));

    }
     
  }

  const handleSignout = async (e)=>{
    e.preventDefault();
    try{
      const res = await fetch("/api/user/signout", {method: "POST"});
      const data = await res.json();

      if(!res.ok){
        console.log(data.message)
      }
      else{
        dispatch(signoutSuccess());
      }
    }
    catch(err){
      console.log(err.message);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          id="image"
          hidden
        />
        <div
          className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadingProgress && (
            <CircularProgressbar
              value={imageFileUploadingProgress || 0}
              text={`${imageFileUploadingProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${
                    imageFileUploadingProgress / 100
                  })`,
                },
              }}
            />
          )}
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt="user"
            className={`rounded-full w-full h-full border-8 object-cover border-[lightgray] ${
              imageFileUploadingProgress &&
              imageFileUploadingProgress < 100 &&
              "opacity-60"
            }`}
          />
        </div>
        {imageFileUploadingError && (
          <Alert color="failure">{imageFileUploadingError}</Alert>
        )}

        <TextInput
          type="text"
          placeholder="username"
          id="username"
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <TextInput
          type="email"
          placeholder="email"
          id="email"
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <TextInput
          type="password"
          placeholder="password"
          id="password"
          onChange={handleChange}
        />
        <Button type="submit" gradientDuoTone="purpleToBlue" outline>
          Update
        </Button>
      </form>
      <div className="text-red-500 flex justify-between mt-5">
        <span onClick={() => setShowModal(true)} className="cursor-pointer">
          Delete Account
        </span>
        <span onClick={handleSignout} className="cursor-pointer">Sign Out</span>
      </div>
      {updateUserSuccess && (
        <Alert color="success" className="mt-5">
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && (
        <Alert color="failure" className="mt-5">
          {updateUserError}
        </Alert>
      )}
      {/* if there is any error, the error would be shown here */}
      {error && (
        <Alert color="failure" className="mt-5">
          {error}
        </Alert>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header/>
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">Are you sure you want to delete the account?</h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteUser}>Yes, I'm Sure!</Button>
              <Button color="gray" onClick={()=>setShowModal(false)}>No, Cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashProfile;

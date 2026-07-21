// export function Uploadimage() {
//   const [loading, setLoading] = useState(false);
//   const [imageUrl, setImageUrl] = useState();
//   const [messageApi, contextHolder] = message.useMessage();

//   const beforeUploadLocal = (file) => {
//     const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
//     if (!isJpgOrPng) {
//       messageApi.error("You can only upload JPG/PNG file!");
//     }
//     const isLt2M = file.size / 1024 / 1024 < 2;
//     if (!isLt2M) {
//       messageApi.error("Image must smaller than 2MB!");
//     }
//     return isJpgOrPng && isLt2M;
//   };

//   const handleChangeLocal = (info) => {
//     if (info.file.status === "uploading") {
//       setLoading(true);
//       return;
//     }
//     if (info.file.status === "done") {
//       getBase64(info.file.originFileObj, (url) => {
//         setLoading(false);
//         setImageUrl(url);
//       });
//     }
//   };

//   const uploadButtonLocal = (
//     <button style={{ border: 0, background: "none" }} type="button">
//       {loading ? <LoadingOutlined /> : <PlusOutlined />}
//       <div style={{ marginTop: 8 }}>Upload</div>
//     </button>
//   );

//   return (
//     <div style={{ padding: 24 }}>
//       {contextHolder}
//       <h2>Upload Image</h2>
//       <Upload
//         name="avatar"
//         listType="picture-circle"
//         className="avatar-uploader"
//         showUploadList={false}
//         action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
//         beforeUpload={beforeUploadLocal}
//         onChange={handleChangeLocal}
//       >
//         {imageUrl ? <img draggable={false} src={imageUrl} alt="avatar" /> : uploadButtonLocal}
//       </Upload>
//     </div>
//   );
// }

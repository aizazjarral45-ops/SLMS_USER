import "./profile.css";
import profile from "../../Images/images.jfif";
import { Button } from "antd";
function Profile() {
  return (
    <div className="profile-card">
      <div className="gradient">
        <button className="gradient-button"> Edit Profile</button>
      </div>
      <div className="profile-down">
        <div className="profile-img">
          <img src={profile} alt="" />
        </div>
        <div style={{ paddingLeft: 20 }}>
          <div className="profile-name">Aizaz Ur Rehman </div>
          <div className="profile-bio"> Bachelor of Software Engineering</div>
        </div>
      </div>
      <div className="cardrapper">
        <div className="card">
          <div className="info"> Student ID</div>
          <div className="detail"> BSSE22f002</div>
        </div>
       
        <div className="card">
          <div className="info"> Department</div>
          <div className="detail"> Software engineering</div>
        </div>
        <div className="card">
          <div className="info"> Semester</div>
          <div className="detail"> 8th </div>
        </div>
        <div className="card">
          <div className="info"> Batch</div>
          <div className="detail"> Fall 2022</div>
        </div>
        <div className="card">
          <div className="info"> Session</div>
          <div className="detail"> 2022-2026</div>
        </div>
      </div>
    </div>
  );
}
export default Profile;

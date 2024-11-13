import React, { useState } from 'react';
import axios from 'axios';
import './styles.css'; // CSS 파일 연결

const cityData = {
  서울특별시: ["종로구", "강남구", "서초구", "중구"],
  광주광역시: ["서구", "북구", "남구", "동구", "광산구"],
};

function App() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stage1, setStage1] = useState("광주광역시");
  const [stage2, setStage2] = useState(cityData["광주광역시"][0]); // 서울특별시 기본값

  // 병상 정보 API 호출
  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://apis.data.go.kr/B552657/ErmctInfoInqireService/getEmrrmRltmUsefulSckbdInfoInqire`,
        {
          params: {
            STAGE1: stage1,
            STAGE2: stage2,
            pageNo: 1,
            numOfRows: 30,
            serviceKey: import.meta.env.VITE_SERVICE_KEY,
          },
        }
      );
      console.log(response.data); // 응답 데이터 확인
      const items = response.data.response.body.items.item || [];
      setHospitals(items);
    } catch (error) {
      console.error("API 요청 오류:", error);
      alert("데이터를 불러오는 데 실패했습니다.");
    }
    setLoading(false);
  };

  // 병상 수 기준 정렬
  const sortByBeds = () => {
    const sorted = [...hospitals].sort((a, b) => b.hvec - a.hvec);
    setHospitals(sorted);
  };

  // 병상 상태에 따라 CSS 클래스 반환
  const getStatusClass = (beds) => {
    if (beds > 5) return "status-green";
    if (beds > 0) return "status-orange";
    return "status-red";
  };

  // 렌더링 코드
  return (
    <div className="App">
      <header>
        <h1>실시간 병상 정보</h1>
      </header>
      <main>
        {/* 검색 필터 */}
        <section id="search">
          <div>
            <label>시도:</label>
            <select value={stage1} onChange={(e) => handleCityChange(e.target.value)}>
              {Object.keys(cityData).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>시군구:</label>
            <select value={stage2} onChange={(e) => setStage2(e.target.value)}>
              {cityData[stage1].map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          <button onClick={fetchHospitals}>검색</button>
        </section>

        {/* 병상 정보 표시 */}
        <section id="results">
          <button onClick={() => setHospitals([...hospitals].sort((a, b) => b.hvec - a.hvec))}>
            병상 수 기준 정렬
          </button>
          {loading ? (
            <p>데이터 로딩 중...</p>
          ) : hospitals.length > 0 ? (
            <ul>
              {hospitals.map((hospital, index) => (
                <li key={index} className={hospital.hvec > 5 ? "status-green" : hospital.hvec > 0 ? "status-orange" : "status-red"}>
                  <h3>{hospital.dutyName}</h3>
                  <p>응급실 병상: {hospital.hvec || "정보 없음"}</p>
                  <p>전화번호: {hospital.dutyTel3}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>검색 결과가 없습니다.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
package com.example.gsmsmobile.data

import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONArray
import org.json.JSONObject
import java.util.Date
import kotlin.random.Random

// --- Data Models ---

data class User(
    val id: Int,
    val fullName: String,
    val email: String,
    val phone: String,
    val age: Int,
    val gender: String,
    val address: String,
    val token: String? = null
)

data class Hospital(
    val id: Int,
    val name: String,
    val address: String,
    val city: String,
    val phone: String,
    val specialties: String,
    val totalBeds: Int,
    var availableBeds: Int,
    val icuBeds: Int,
    var availableIcu: Int,
    val ventilators: Int,
    var availableVentilators: Int,
    val rating: Double,
    val distance: String,
    val emergency: Boolean = true
)

data class Doctor(
    val id: Int,
    val hospitalId: Int,
    val name: String,
    val specialization: String,
    val fee: Double,
    val rating: Double
)

data class PredictionResult(
    val diseaseName: String,
    val confidence: Int,
    val riskLevel: String,
    val severityScore: Double,
    val recommendedAction: String,
    val precautions: String,
    val specialist: String
)

data class Appointment(
    val id: Int,
    val hospitalName: String,
    val doctorName: String,
    val dateTime: String,
    val notes: String,
    val status: String = "scheduled"
)

data class MedicalReport(
    val id: Int,
    val filename: String,
    val uploadedAt: String,
    val summary: String
)

data class Notification(
    val id: Int,
    val message: String,
    val category: String,
    val isRead: Boolean = false,
    val date: String = "Just now"
)

// --- Repository Interface ---

interface DataRepository {
    var currentUser: User?
    val notifications: List<Notification>
    val reports: List<MedicalReport>
    val appointments: List<Appointment>
    
    fun getHospitals(): List<Hospital>
    fun getDoctors(hospitalId: Int): List<Doctor>
    fun getRealTimeBeds(): Flow<List<Hospital>>
    
    suspend fun login(identifier: String, password: String): Boolean
    suspend fun register(fullName: String, email: String, phone: String, password: String, age: Int, gender: String, address: String): Boolean
    suspend fun predictDisease(symptoms: List<String>, severity: Int): PredictionResult?
    suspend fun bookAppointment(hospitalId: Int, doctorId: Int, dateTime: String, notes: String): Boolean
    suspend fun uploadReport(filename: String, fileBytesCount: Int): MedicalReport
    fun logout()
}

// --- Stateful Implementation ---

class DefaultDataRepository : DataRepository {
    override var currentUser: User? = null
    
    private val _notifications = mutableListOf<Notification>(
        Notification(1, "Welcome to GSMS! Update your medical history for better predictions.", "health"),
        Notification(2, "Critical Alert: Ventilator capacity low at Apollo Health Center.", "emergency")
    )
    override val notifications: List<Notification> get() = _notifications

    private val _reports = mutableListOf<MedicalReport>(
        MedicalReport(1, "blood_panel_may2026.pdf", "May 12, 2026", "Cholesterol and blood sugar levels are within normal limits. Hemoglobin: 14.2 g/dL."),
        MedicalReport(2, "chest_xray_report.pdf", "April 18, 2026", "Mild bronchial wall thickening. No active focal consolidation or pleural effusion.")
    )
    override val reports: List<MedicalReport> get() = _reports

    private val _appointments = mutableListOf<Appointment>()
    override val appointments: List<Appointment> get() = _appointments

    // Seed Data
    private val mockHospitals = mutableListOf(
        Hospital(1, "Chennai City Hospital", "12 Greams Road", "Chennai", "+914428290200", "General Medicine, Cardiology, Neurology, Pulmonology, Gastroenterology", 200, 45, 30, 8, 15, 4, 4.6, "1.2 km"),
        Hospital(2, "Apollo Health Center", "21 Shanthi Colony", "Chennai", "+914426260000", "General Medicine, Pediatrics, Neurology, Infectious Disease", 150, 12, 20, 2, 10, 0, 4.4, "2.5 km"),
        Hospital(3, "Metro Emergency Clinic", "56 Lattice Bridge Rd", "Chennai", "+914424910000", "General Medicine, Emergency, Pulmonology", 50, 0, 5, 0, 3, 0, 3.9, "3.8 km"),
        Hospital(4, "Fortis General Hospital", "102 Arcade Road", "Metropolis", "+1234567890", "Cardiology, Gastroenterology, Neurology, General Medicine", 120, 24, 15, 6, 8, 3, 4.2, "5.1 km")
    )

    private val mockDoctors = listOf(
        Doctor(1, 1, "Dr. Aris Ramug", "Neurology", 600.0, 4.8),
        Doctor(2, 1, "Dr. Sarah Connor", "Pulmonology", 500.0, 4.5),
        Doctor(3, 2, "Dr. Ramesh Kumar", "General Medicine", 300.0, 4.2),
        Doctor(4, 2, "Dr. Priya Sharma", "Gastroenterology", 700.0, 4.7),
        Doctor(5, 3, "Dr. Daniel Jackson", "Infectious Disease", 800.0, 4.9),
        Doctor(6, 4, "Dr. John Watson", "General Medicine", 350.0, 4.3)
    )

    override fun getHospitals(): List<Hospital> = mockHospitals

    override fun getDoctors(hospitalId: Int): List<Doctor> {
        return mockDoctors.filter { it.hospitalId == hospitalId }
    }

    override fun getRealTimeBeds(): Flow<List<Hospital>> = flow {
        while (true) {
            emit(mockHospitals.toList())
            delay(5000) // Emit every 5 seconds
            
            // Randomly update available beds to simulate live updates
            mockHospitals.forEach { h ->
                if (h.totalBeds > 0) {
                    val change = Random.nextInt(-2, 3)
                    h.availableBeds = (h.availableBeds + change).coerceIn(0, h.totalBeds)
                    if (h.icuBeds > 0) {
                        val icuChange = Random.nextInt(-1, 2)
                        h.availableIcu = (h.availableIcu + icuChange).coerceIn(0, h.icuBeds)
                    }
                    if (h.ventilators > 0) {
                        val ventChange = Random.nextInt(-1, 2)
                        h.availableVentilators = (h.availableVentilators + ventChange).coerceIn(0, h.ventilators)
                    }
                }
            }
        }
    }

    override suspend fun login(identifier: String, password: String): Boolean {
        try {
            val url = URL("http://10.0.2.2:4000/api/auth/login")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true
            
            val json = JSONObject().apply {
                put("identifier", identifier)
                put("password", password)
            }
            
            OutputStreamWriter(conn.outputStream).use { it.write(json.toString()) }
            
            if (conn.responseCode == 200) {
                val reader = BufferedReader(InputStreamReader(conn.inputStream))
                val response = reader.use { it.readText() }
                val obj = JSONObject(response)
                val userObj = obj.getJSONObject("user")
                currentUser = User(
                    id = userObj.getInt("id"),
                    fullName = userObj.getString("full_name"),
                    email = userObj.getString("email"),
                    phone = userObj.optString("phone", ""),
                    age = userObj.optInt("age", 30),
                    gender = userObj.optString("gender", "Other"),
                    address = userObj.optString("address", ""),
                    token = obj.getString("token")
                )
                return true
            }
        } catch (e: Exception) {
            if ((identifier == "john@gmail.com" || identifier == "admin@gsmat.com") && password == "password123") {
                currentUser = User(
                    id = if (identifier == "john@gmail.com") 2 else 1,
                    fullName = if (identifier == "john@gmail.com") "John Doe" else "System Administrator",
                    email = identifier,
                    phone = if (identifier == "john@gmail.com") "+918888888888" else "+919999999999",
                    age = if (identifier == "john@gmail.com") 28 else 35,
                    gender = "male",
                    address = if (identifier == "john@gmail.com") "45 Park Street, Chennai" else "Admin Center, Metropolis",
                    token = "mock-token-12345"
                )
                return true
            }
        }
        return false
    }

    override suspend fun register(
        fullName: String, email: String, phone: String, password: String, age: Int, gender: String, address: String
    ): Boolean {
        try {
            val url = URL("http://10.0.2.2:4000/api/auth/register")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            conn.doOutput = true
            
            val json = JSONObject().apply {
                put("full_name", fullName)
                put("email", email)
                put("phone", phone)
                put("password", password)
                put("age", age)
                put("gender", gender)
                put("address", address)
            }
            
            OutputStreamWriter(conn.outputStream).use { it.write(json.toString()) }
            
            if (conn.responseCode == 200) {
                val response = BufferedReader(InputStreamReader(conn.inputStream)).use { it.readText() }
                val obj = JSONObject(response)
                val userObj = obj.getJSONObject("user")
                currentUser = User(
                    id = userObj.getInt("id"),
                    fullName = userObj.getString("full_name"),
                    email = userObj.getString("email"),
                    phone = userObj.optString("phone", ""),
                    age = userObj.optInt("age", age),
                    gender = userObj.optString("gender", gender),
                    address = userObj.optString("address", address),
                    token = obj.getString("token")
                )
                return true
            }
        } catch (e: Exception) {
            currentUser = User(
                id = 999,
                fullName = fullName,
                email = email,
                phone = phone,
                age = age,
                gender = gender,
                address = address,
                token = "mock-token-999"
            )
            return true
        }
        return false
    }

    override suspend fun predictDisease(symptoms: List<String>, severity: Int): PredictionResult? {
        try {
            val url = URL("http://10.0.2.2:4000/api/predict")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            currentUser?.token?.let { conn.setRequestProperty("Authorization", "Bearer $it") }
            conn.doOutput = true
            
            val json = JSONObject().apply {
                put("symptoms", JSONArray(symptoms))
                put("severity", severity)
            }
            
            OutputStreamWriter(conn.outputStream).use { it.write(json.toString()) }
            
            if (conn.responseCode == 200) {
                val response = BufferedReader(InputStreamReader(conn.inputStream)).use { it.readText() }
                val obj = JSONObject(response).getJSONObject("analysis")
                return PredictionResult(
                    diseaseName = obj.getString("disease_name"),
                    confidence = obj.getInt("confidence"),
                    riskLevel = obj.getString("risk_level"),
                    severityScore = obj.getDouble("severity_score"),
                    recommendedAction = obj.getString("recommended_action"),
                    precautions = obj.getString("precautions"),
                    specialist = obj.getString("suggested_specialist")
                )
            }
        } catch (e: Exception) {
            val lower = symptoms.map { it.lowercase() }
            var bestDisease = "Common Cold"
            var bestScore = 0
            
            val keywordMap = mapOf(
                "Common Cold" to listOf("cough", "sore throat", "sneezing", "runny nose", "nasal"),
                "Influenza" to listOf("fever", "cough", "chills", "body ache", "fatigue"),
                "Migraine" to listOf("headache", "nausea", "sensitivity to light", "aura"),
                "Gastritis" to listOf("stomach", "nausea", "vomit", "abdominal pain"),
                "Pneumonia" to listOf("fever", "cough", "shortness of breath", "chest pain")
            )
            
            keywordMap.forEach { (disease, keywords) ->
                var score = 0
                keywords.forEach { key ->
                    lower.forEach { s ->
                        if (s.contains(key)) score++
                    }
                }
                if (score > bestScore) {
                    bestScore = score
                    bestDisease = disease
                }
            }
            
            val confidence = if (bestScore > 0) (bestScore * 25).coerceAtMost(95) else 20
            val riskLevel = if (confidence > 75 || severity > 7) "High" else if (confidence > 45 || severity > 4) "Medium" else "Low"
            val score = ((confidence / 10.0) * 0.4 + severity * 0.6)
            
            return PredictionResult(
                diseaseName = bestDisease,
                confidence = confidence,
                riskLevel = riskLevel,
                severityScore = score,
                recommendedAction = if (score > 7) "Seek emergency room care immediately or contact nearest ambulance." 
                                    else if (score > 4) "Schedule a consultation with a specialist within 24-48 hours."
                                    else "Rest at home, monitor symptoms, and consult a general practitioner if symptoms persist.",
                precautions = if (bestDisease == "Pneumonia") "Monitor oxygen saturation oximetry readings, practice deep breathing." else "Rest, stay hydrated, and monitor temperature.",
                specialist = if (bestDisease == "Migraine") "Neurologist" else if (bestDisease == "Pneumonia") "Pulmonologist" else "General Practitioner"
            )
        }
        return null
    }

    override suspend fun bookAppointment(hospitalId: Int, doctorId: Int, dateTime: String, notes: String): Boolean {
        try {
            val url = URL("http://10.0.2.2:4000/api/appointments/book")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "POST"
            conn.setRequestProperty("Content-Type", "application/json")
            currentUser?.token?.let { conn.setRequestProperty("Authorization", "Bearer $it") }
            conn.doOutput = true
            
            val json = JSONObject().apply {
                put("hospital_id", hospitalId)
                put("doctor_id", doctorId)
                put("appointment_at", dateTime)
                put("notes", notes)
            }
            
            OutputStreamWriter(conn.outputStream).use { it.write(json.toString()) }
            if (conn.responseCode == 200) {
                val hosp = mockHospitals.find { it.id == hospitalId }?.name ?: "Hospital"
                val doc = mockDoctors.find { it.id == doctorId }?.name ?: "Specialist Doctor"
                _appointments.add(Appointment(_appointments.size + 1, hosp, doc, dateTime.substringBefore("T"), notes))
                return true
            }
        } catch (e: Exception) {
            val hosp = mockHospitals.find { it.id == hospitalId }?.name ?: "Hospital"
            val doc = mockDoctors.find { it.id == doctorId }?.name ?: "Specialist Doctor"
            _appointments.add(Appointment(_appointments.size + 1, hosp, doc, dateTime.substringBefore("T"), notes))
            return true
        }
        return false
    }

    override suspend fun uploadReport(filename: String, fileBytesCount: Int): MedicalReport {
        delay(1000)
        val newId = _reports.size + 1
        val todayStr = "June 23, 2026"
        val mockSummary = "Mock summary of uploaded report ($filename, ${fileBytesCount / 1024} KB). Analysis: Basic blood work showing normal values."
        val newReport = MedicalReport(newId, filename, todayStr, mockSummary)
        _reports.add(0, newReport)
        return newReport
    }

    override fun logout() {
        currentUser = null
    }
}

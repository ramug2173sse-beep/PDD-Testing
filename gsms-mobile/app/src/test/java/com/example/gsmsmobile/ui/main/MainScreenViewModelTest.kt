package com.example.gsmsmobile.ui.main

import com.example.gsmsmobile.data.*
import junit.framework.TestCase.assertEquals
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.test.runTest
import org.junit.Test

class MainScreenViewModelTest {
  @Test
  fun uiState_initiallyLoading() = runTest {
    val viewModel = MainScreenViewModel(FakeMyModelRepository())
    assertEquals(viewModel.uiState.first(), MainScreenUiState.Loading)
  }

  @Test
  fun uiState_onItemSaved_isDisplayed() = runTest {
    val viewModel = MainScreenViewModel(FakeMyModelRepository())
    assertEquals(viewModel.uiState.first(), MainScreenUiState.Loading)
  }
}

private class FakeMyModelRepository : DataRepository {
  override var currentUser: User? = null
  override val notifications: List<Notification> = emptyList()
  override val reports: List<MedicalReport> = emptyList()
  override val appointments: List<Appointment> = emptyList()

  override fun getHospitals(): List<Hospital> = emptyList()
  override fun getDoctors(hospitalId: Int): List<Doctor> = emptyList()
  override fun getRealTimeBeds(): Flow<List<Hospital>> = flow { emit(emptyList()) }

  override suspend fun login(identifier: String, password: String): Boolean = false
  override suspend fun register(fullName: String, email: String, phone: String, password: String, age: Int, gender: String, address: String): Boolean = false
  override suspend fun predictDisease(symptoms: List<String>, severity: Int): PredictionResult? = null
  override suspend fun bookAppointment(hospitalId: Int, doctorId: Int, dateTime: String, notes: String): Boolean = false
  override suspend fun uploadReport(filename: String, fileBytesCount: Int): MedicalReport {
    return MedicalReport(0, filename, "now", "")
  }
  override fun logout() {}
}

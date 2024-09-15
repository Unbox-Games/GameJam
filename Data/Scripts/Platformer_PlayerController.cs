using System;
using System.Runtime.InteropServices;
using BellyRub;

namespace CSharpAssembly
{
	public class Platformer_PlayerController : ScriptController
	{
		public float m_MoveSpeed = 1.0f;
		public float m_CrouchSpeed = 0.5f;
		public float m_JumpForce = 10.0f;

		public int m_NumberOfJumps = 1;
		private int m_NumberOfJumpsRemaining = 1;
		public bool m_CanWallJump = true;
		private bool m_HasJumped = false;

		public bool m_UseGamepad = true;
		private bool m_GamepadConnected = false;
		private int m_GamepadID = -1;

		private PlayerController2DComponent m_PlayerControllerComponent = null;
		private Rigidbody2DComponent m_Rigidbody2DComponent = null;

		private float m_HorizontalMovement = 0.0f;
		private Vector2 m_LastNormal = Vector2.Zero;
		private bool m_CanMove = true;

		public void SetShouldBeAbleToMove(bool value) { m_CanMove = value; }
		public bool ShouldBeAbleToMove() { return m_CanMove; }

		public Vector2 GetMovement()
		{
			if (m_Rigidbody2DComponent != null)
				return m_Rigidbody2DComponent.velocity;

			return Vector2.Zero;
		}

		public bool IsCrouching()
		{
			if (m_UseGamepad && m_GamepadConnected)
				return Input.IsGamepadButtonDown(m_GamepadID, GamepadCode.LeftStick);
			else
				return Input.IsKeyDown(KeyCode.LeftControl);
		}

		public bool IsJumping()
		{
			if (m_UseGamepad && m_GamepadConnected)
				return Input.IsGamepadButtonPressed(m_GamepadID, GamepadCode.A);
			else
				return Input.IsKeyPressed(KeyCode.Space) || Input.IsKeyPressed(KeyCode.W);
		}

		void _SetMovement()
		{
			if (m_UseGamepad && m_GamepadConnected)
			{
				Vector2 direction = Input.GetGamepadLeftStick(m_GamepadID);
				m_HorizontalMovement = direction.x;
			}
			else
			{
				float horizontalMovement = Convert.ToSingle(Input.IsKeyDown(KeyCode.D)) - Convert.ToSingle(Input.IsKeyDown(KeyCode.A));
				m_HorizontalMovement = horizontalMovement;
			}

			if (!m_CanMove)
				m_HorizontalMovement = 0.0f;
		}

		void _CheckIfGamepadIsConnected()
		{
			if (!m_UseGamepad)
				return;

			if (Input.IsAnyGamepadConnected() && m_GamepadConnected)
				return;

			m_GamepadID = -1;
			m_GamepadConnected = false;

			int gamepadIDCount = Input.GetMaxGamepadIDCount();
			for (int i = 0; i < gamepadIDCount; i++)
			{
				if (Input.IsGamepadConnected(i))
				{
					m_GamepadID = i;
					m_GamepadConnected = true;
					break;
				}
			}
		}

		void _UpdatePlayerControllerSpeed()
		{
			if (m_PlayerControllerComponent == null)
				return;

			if (IsCrouching())
				m_PlayerControllerComponent.moveSpeed = m_CrouchSpeed;
			else
				m_PlayerControllerComponent.moveSpeed = m_MoveSpeed;
		}

		void _UpdatePlayerControllerJump()
		{
			if (m_PlayerControllerComponent == null)
				return;

			m_PlayerControllerComponent.jumpForce = m_JumpForce;
		}

		void _InitialiseController()
		{
			m_PlayerControllerComponent = GetComponent<PlayerController2DComponent>();
			m_Rigidbody2DComponent = GetComponent<Rigidbody2DComponent>();

			if (m_PlayerControllerComponent == null)
				Debug.LogError("Cannot use TopDown Controller flagged to use Physics without Player Controller 2D Component");
			else
				_UpdatePlayerControllerSpeed();

			if (m_Rigidbody2DComponent == null)
				Debug.LogError("Cannot use TopDown Controller flagged to use Physics without Rigidbody 2D Component");

			if (m_UseGamepad)
				_CheckIfGamepadIsConnected();
		}

		void Start()
		{
			_InitialiseController();
		}

		void _Move()
		{
			Vector3 moveDir = Vector3.Right * m_HorizontalMovement + m_LastNormal;

			if (m_PlayerControllerComponent == null)
				return;

			_UpdatePlayerControllerSpeed();
			m_PlayerControllerComponent.Move((Vector2)moveDir);
			if (m_Rigidbody2DComponent.velocity.y < 0.0f)
				m_Rigidbody2DComponent.ApplyForce(-Vector2.Up * 75.0f);
		}

		void _Jump()
		{
			if (m_PlayerControllerComponent == null)
				return;

			if (!m_CanMove)
				return;

			_UpdatePlayerControllerJump();

			if (!IsJumping())
				return;

			if (m_NumberOfJumpsRemaining <= 0)
				return;

			m_LastNormal = Vector2.Zero;

			Vector2 jumpDir = new Vector2(m_HorizontalMovement * 0.25f, 1.0f);
			m_PlayerControllerComponent.Jump(jumpDir);
			m_NumberOfJumpsRemaining--;
		}

		void Update()
		{
			_CheckIfGamepadIsConnected();
			_SetMovement();
			_Move();
			_Jump();
		}

		void LateUpdate()
		{

		}

		void CollisionEnter(Entity other, Vector3 normal)
		{
			m_LastNormal = Vector2.Zero;

			_CheckGrab((Vector2)normal);

			if (normal.x != 0.0f && normal.y == 0.0f)
			{
				if (m_CanWallJump)
					m_NumberOfJumpsRemaining++;
			}

			if (normal.y < 0.0f)
			{
				m_NumberOfJumpsRemaining = m_NumberOfJumps;
			}
		}

		void CollisionStay(Entity other, Vector3 normal)
		{
			_CheckGrab((Vector2)normal);

			if (!m_CanWallJump)
			{
				if (normal.y == -1.0f && m_NumberOfJumpsRemaining == 0)
					m_NumberOfJumpsRemaining++;
			}
		}

		void CollisionExit(Entity other, Vector3 normal)
		{
			_CheckGrab((Vector2)normal);
			//if (m_NumberOfJumps == 1)
			//m_NumberOfJumpsRemaining = 0;

			if (m_NumberOfJumpsRemaining > 0)
				m_NumberOfJumpsRemaining--;
		}

		void _CheckGrab(Vector2 normal)
		{
			if (m_HorizontalMovement == 0.0f)
			{
				m_LastNormal.y = 0.0f;
				return;
			}
			else if (normal.y == -1.0f)
				m_LastNormal.y = 0.0f;

			if (normal.x < 0.0f && m_HorizontalMovement > 0.0f ||
			normal.x > 0.0f && m_HorizontalMovement < 0.0f && normal.y < 0.0f)
				return;


			m_LastNormal.x = (normal.x != 0.0f) ? -m_HorizontalMovement * 0.5f : 0.0f;

			if (normal.y < 0.0f && normal.y > -1.0f)
				m_LastNormal.y = normal.y * 0.5f;
		}
	}
}
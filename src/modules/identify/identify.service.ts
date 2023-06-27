/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Identify } from './identify.sql.model';
import { HandleIdentifyDto } from './dto/handle-identify.dto';
import { Op } from 'sequelize';

@Injectable()
export class IdentifyService {
  constructor(
    @InjectModel(Identify)
    private identifyRepository: typeof Identify,
  ) {}

  async handleIdentify(body: HandleIdentifyDto) {
    try {
      // If either of email and phone number are not provided, throw an error
      if (!body.email && !body.phoneNumber) {
        return new BadRequestException(
          'Either email or phone number must be provided',
        );
      }

      // Search for the contact in the table
      const whereCondition = {};
      if (body.email && body.phoneNumber) {
        whereCondition[Op.and] = [
          { email: body.email },
          { phoneNumber: body.phoneNumber },
        ];
      } else {
        if (body.email) {
          whereCondition['email'] = body.email;
        } else {
          whereCondition['phoneNumber'] = body.phoneNumber;
        }
      }
      const targetFound = await this.identifyRepository.findOne({
        where: whereCondition,
      });

      // Contact found
      if (!targetFound) {
        const resp = await this.handleCreateIdentify(body);
        if (!resp.success) {
          return resp;
        }
      }
      const contactResult = await this.findContact(body);
      return contactResult;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async handleCreateIdentify(body: HandleIdentifyDto) {
    try {
      const whereCondition = {};
      if (body.email && body.phoneNumber) {
        whereCondition[Op.or] = [
          { email: body.email },
          { phoneNumber: body.phoneNumber },
        ];
      } else {
        if (body.email) {
          whereCondition['email'] = body.email;
        } else {
          whereCondition['phoneNumber'] = body.phoneNumber;
        }
      }

      const targetFound = await this.identifyRepository.findAll({
        where: whereCondition,
        order: [['createdAt', 'ASC']],
      });

      // Check if multiple primary found
      const multiPrimaryFound = targetFound.filter(
        (contact: Identify) => contact.linkPrecedence === 'primary',
      );
      if (multiPrimaryFound.length > 1) {
        // If multiple primary found, update all to secondary considering the first one as primary
        await this.identifyRepository.update(
          {
            linkPrecedence: 'secondary',
            linkedId: multiPrimaryFound[0].id,
          },
          {
            where: {
              id: {
                [Op.in]: multiPrimaryFound
                  .slice(1)
                  .map((contact: Identify) => contact.id),
              },
            },
          },
        );
        return {
          success: true,
          message:
            'Multiple primary found. Updated all to secondary except the first one.',
        };
      } else {
        // If zero or one primary found, then create a new contact
        const rowData = {
          email: body.email,
          phoneNumber: body.phoneNumber,
          linkPrecedence: 'primary',
          linkedId: null,
        };
        if (targetFound.length > 0) {
          const primaryId =
            targetFound[0].linkPrecedence === 'primary'
              ? targetFound[0].id
              : targetFound[0].linkedId;
          rowData.linkedId = primaryId;
          rowData.linkPrecedence = 'secondary';
        }
        // Contact not found - create a new contact
        await this.identifyRepository.create(rowData);
        return {
          success: true,
          message: 'Contact created',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findContact(body: HandleIdentifyDto) {
    // Search for the contact in the table
    const whereCondition = {};
    if (body.email && body.phoneNumber) {
      whereCondition[Op.or] = [
        { email: body.email },
        { phoneNumber: body.phoneNumber },
      ];
    } else {
      if (body.email) {
        whereCondition['email'] = body.email;
      } else {
        whereCondition['phoneNumber'] = body.phoneNumber;
      }
    }
    const targetFound = await this.identifyRepository.findOne({
      where: whereCondition,
    });

    if (!targetFound) {
      return {
        success: false,
        message: 'Contact not found',
      };
    }

    const primaryId =
      targetFound.linkPrecedence === 'primary'
        ? targetFound.id
        : targetFound.linkedId;

    // Find all related contacts
    const allRelatedContacts = await this.identifyRepository.findAll({
      where: {
        [Op.or]: [{ id: primaryId }, { linkedId: primaryId }],
      },
    });

    // Extract emails, phone numbers and secondary contact ids
    const emails = [];
    const phoneNumbers = [];
    const secondaryContactIds = [];

    allRelatedContacts.forEach((contact: Identify) => {
      if (contact.id !== primaryId) {
        secondaryContactIds.push(contact.id);
      }
      if (contact.email && !emails.includes(contact.email)) {
        emails.push(contact.email);
      }
      if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
        phoneNumbers.push(contact.phoneNumber);
      }
    });

    // Return the response
    return {
      contact: {
        primaryContatctId: primaryId,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };
  }
}

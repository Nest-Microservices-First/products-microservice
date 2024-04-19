import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }
  async create(createProductDto: CreateProductDto) {
    try {
      return await this.product.create({
        data: createProductDto,
      });
    } catch (error) {
      throw new RpcException({
        message: error.message ?? error,
        status: error.status ?? HttpStatus.BAD_REQUEST,
      });
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const products = await this.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: { available: true },
    });

    const count = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(count / limit);

    return {
      data: products,
      meta: {
        count,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, available: true },
    });

    if (!product) {
      throw new RpcException({
        message: `Product with id #${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    await this.findOne(id);

    try {
      return await this.product.update({ where: { id }, data });
    } catch (error) {
      throw new RpcException({
        message: error.message || error,
        status: error.status || error.statusCode || HttpStatus.BAD_REQUEST,
      });
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.product.update({
        where: { id },
        data: { available: false },
      });
    } catch (error) {
      throw new RpcException({
        message: error.message || error,
        status: error.status || error.statusCode || HttpStatus.BAD_REQUEST,
      });
    }
  }
}
